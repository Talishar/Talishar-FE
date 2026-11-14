import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'app/Hooks';
import { BACKEND_URL, URL_END_POINT } from 'appConstants';
import { setGameStart } from 'features/game/GameSlice';
import {
  useCreateGameMutation,
  useFindMatchMutation
} from 'features/api/apiSlice';
import { CreateGameAPI } from 'interface/API/CreateGame.php';
import { parseBackendJson } from 'utils/parseBackendResponse';
import {
  describeThrownError,
  ServerError,
  ServerErrorCard,
  toServerError
} from 'utils/serverError';

export const MAX_FIND_MATCH_QUEUES = 3;

export interface FindMatchQueueDeck {
  fabdb: string;
  favoriteDecks: string;
  bazaarDeckId?: string;
}

export interface FindMatchQueueEntry {
  id: string;
  format: string;
  /** Set ID of the deck's hero, '' for an imported deck */
  hero: string;
  preference: string;
  deckLabel: string;
  heroImage?: string;
  deck: FindMatchQueueDeck;
  /** The create form values, used when this queue hosts */
  createValues: CreateGameAPI;
}

export type FindMatchQueueStatus = 'searching' | 'hosting';

export type QueueJoinAttempt =
  | { ok: true }
  | {
      ok: false;
      error: string;
      cards?: ServerErrorCard[];
      lobbyTaken: boolean;
    };

type JoinWithQueueDeck = (
  gameName: number,
  options: { deck: FindMatchQueueDeck; findMatch: boolean }
) => Promise<QueueJoinAttempt>;

interface HostedLobby {
  gameName: number;
  playerID: number;
  authKey: string;
  bazaarDeckId?: string;
}

interface RunningQueue {
  controller: AbortController;
  ticket?: string;
}

const SEARCH_DECIDE_MS = 45000;
const POLL_RETRY_MS = 1500;

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });

// Long-polls one hosted lobby until an opponent takes the seat. Polling is also
// what keeps the lobby listed, so stopping it closes the lobby for joiners.
const refreshLobby = (
  lobby: HostedLobby,
  lastUpdate: number,
  signal?: AbortSignal
) =>
  fetch(`${BACKEND_URL}${URL_END_POINT.GET_LOBBY_REFRESH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    signal,
    body: JSON.stringify({
      gameName: lobby.gameName,
      playerID: lobby.playerID,
      authKey: lobby.authKey,
      lastUpdate
    })
  });

const waitForOpponent = async (
  lobby: HostedLobby,
  signal: AbortSignal
): Promise<boolean> => {
  let lastUpdate = 0;
  while (!signal.aborted) {
    try {
      const response = await refreshLobby(lobby, lastUpdate, signal);
      const body = (await response.text()).trim();
      if (response.status === 403 || response.status === 404) return false;
      if (response.ok && body !== '' && body !== '0') {
        const data = parseBackendJson(body) as {
          lastUpdate?: number | string;
          opponentSeatOccupied?: boolean;
          isMainGameReady?: boolean;
          error?: string;
        };
        if (data.opponentSeatOccupied || data.isMainGameReady) return true;
        lastUpdate = Number(data.lastUpdate) || 0;
        continue;
      }
    } catch {
      if (signal.aborted) return false;
    }
    await sleep(POLL_RETRY_MS, signal);
  }
  return false;
};

// Every queued deck searches on its own as soon as it is added: it joins a
// fitting lobby or hosts one in the background, and the first match wins.
export const useFindMatchQueues = (joinWithDeck: JoinWithQueueDeck) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [findMatch] = useFindMatchMutation();
  const [createGame] = useCreateGameMutation();

  const [queues, setQueues] = useState<FindMatchQueueEntry[]>([]);
  const [statuses, setStatuses] = useState<
    Record<string, FindMatchQueueStatus>
  >({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [searchError, setSearchError] = useState<ServerError | null>(null);
  const running = useRef(new Map<string, RunningQueue>());
  const matched = useRef(false);

  const stopQueue = useCallback(
    (id: string) => {
      const run = running.current.get(id);
      if (!run) return;
      running.current.delete(id);
      run.controller.abort();
      if (run.ticket) findMatch({ cancel: run.ticket }).catch(() => undefined);
    },
    [findMatch]
  );

  const dropQueue = useCallback(
    (id: string) => {
      stopQueue(id);
      setQueues((prev) => prev.filter((queue) => queue.id !== id));
      setStatuses((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (running.current.size === 0) setStartedAt(null);
    },
    [stopQueue]
  );

  const leaveAll = useCallback(() => {
    Array.from(running.current.keys()).forEach(stopQueue);
    setQueues([]);
    setStatuses({});
    setStartedAt(null);
  }, [stopQueue]);

  useEffect(
    () => () => {
      running.current.forEach((run) => run.controller.abort());
      running.current.clear();
    },
    []
  );

  const onMatched = useCallback(
    (id: string) => {
      if (matched.current) return false;
      matched.current = true;
      running.current.delete(id);
      leaveAll();
      return true;
    },
    [leaveAll]
  );

  const runQueue = useCallback(
    async (entry: FindMatchQueueEntry, run: RunningQueue) => {
      const { signal } = run.controller;
      const setStatus = (status: FindMatchQueueStatus) =>
        setStatuses((prev) =>
          signal.aborted ? prev : { ...prev, [entry.id]: status }
        );
      const fail = (error: ServerError) => {
        if (signal.aborted || matched.current) return;
        dropQueue(entry.id);
        setSearchError(error);
      };
      const failed: number[] = [];

      try {
        let deadline = Date.now() + SEARCH_DECIDE_MS;
        while (!signal.aborted && !matched.current) {
          if (Date.now() > deadline) {
            fail({ title: t('FIND_MATCH.SEARCH_TIMEOUT') });
            return;
          }
          let step;
          try {
            step = await findMatch({
              hero: entry.hero,
              preference: entry.preference,
              format: entry.format,
              exclude: failed
            }).unwrap();
          } catch (err) {
            step = {
              error: describeThrownError(err, t('NOTICE.JOIN_FAILED'))
            };
          }
          if (signal.aborted || matched.current) return;

          if (step.action === 'wait') {
            await sleep(step.retryMs || 1000, signal);
            continue;
          }

          if (step.action === 'join') {
            for (const gameName of step.games) {
              if (signal.aborted || matched.current) return;
              const attempt = await joinWithDeck(gameName, {
                deck: entry.deck,
                findMatch: true
              });
              if (attempt.ok) {
                onMatched(entry.id);
                return;
              }
              if (!attempt.lobbyTaken) {
                fail(toServerError(attempt.error, attempt.cards));
                return;
              }
              failed.push(gameName);
            }
            await sleep(1000, signal);
            continue;
          }

          if (step.action === 'host') {
            run.ticket = step.ticket;
            const response = await createGame({
              ...entry.createValues,
              findMatchTicket: step.ticket
            }).unwrap();
            if (
              response.error ||
              !response.playerID ||
              !response.gameName ||
              !response.authKey
            ) {
              fail(
                toServerError(
                  response.error ?? t('NOTICE.CREATE_FAILED'),
                  response.errorCards
                )
              );
              return;
            }
            if (signal.aborted || matched.current) return;
            const lobby: HostedLobby = {
              gameName: Number(response.gameName),
              playerID: response.playerID,
              authKey: response.authKey,
              bazaarDeckId: entry.deck.bazaarDeckId
            };
            setStatus('hosting');
            const found = await waitForOpponent(lobby, signal);
            if (signal.aborted || matched.current) return;
            if (found && onMatched(entry.id)) {
              await refreshLobby(lobby, 0).catch(() => undefined);
              dispatch(
                setGameStart({
                  playerID: lobby.playerID,
                  gameID: lobby.gameName,
                  authKey: lobby.authKey,
                  bazaarDeckId: lobby.bazaarDeckId
                })
              );
              navigate(`/game/lobby/${lobby.gameName}`, {
                state: { playerID: lobby.playerID }
              });
              return;
            }
            findMatch({ cancel: step.ticket }).catch(() => undefined);
            run.ticket = undefined;
            setStatus('searching');
            deadline = Date.now() + SEARCH_DECIDE_MS;
            continue;
          }

          fail({ title: step.error ?? t('FIND_MATCH.SEARCH_TIMEOUT') });
          return;
        }
      } catch (err) {
        fail(
          err && typeof err === 'object' && 'title' in err
            ? (err as ServerError)
            : { title: describeThrownError(err, t('NOTICE.CREATE_FAILED')) }
        );
      }
    },
    [
      createGame,
      dispatch,
      dropQueue,
      findMatch,
      joinWithDeck,
      navigate,
      onMatched,
      t
    ]
  );

  // Adds a queue (replacing this format's) and starts searching it right away.
  const joinQueue = useCallback(
    (entry: Omit<FindMatchQueueEntry, 'id'>) => {
      const replaced = queues.find((queue) => queue.format === entry.format);
      if (!replaced && queues.length >= MAX_FIND_MATCH_QUEUES) return;
      if (replaced) stopQueue(replaced.id);
      const queue: FindMatchQueueEntry = {
        ...entry,
        id: `${entry.format}-${Date.now().toString(36)}`
      };
      matched.current = false;
      setSearchError(null);
      setQueues((prev) => [
        ...prev.filter((other) => other.format !== entry.format),
        queue
      ]);
      setStatuses((prev) => {
        const next = { ...prev, [queue.id]: 'searching' as const };
        if (replaced) delete next[replaced.id];
        return next;
      });
      setStartedAt((prev) => prev ?? Date.now());
      const run: RunningQueue = { controller: new AbortController() };
      running.current.set(queue.id, run);
      runQueue(queue, run);
    },
    [queues, runQueue, stopQueue]
  );

  return {
    queues,
    statuses,
    startedAt,
    joinQueue,
    leaveQueue: dropQueue,
    leaveAll,
    searchError,
    setSearchError
  };
};
