import React from 'react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';

export const EventsHandler = React.memo(() => {
  const events = useAppSelector((state: RootState) => state.game.events);

  if (!events) {
    return null;
  }

  for (const event of events) {
    switch (event.eventType) {
      case 'ROLL':
        toast(`Die rolled, result: ${event.eventValue}`);
        continue;
      case 'REVEAL':
        toast(`Card revealed: ${event.eventValue}`);
        continue;
      case 'DISCARD':
        toast(`Card discarded: ${event.eventValue}`);
        continue;
      default:
        continue;
    }
  }

  return null;
});

export default EventsHandler;
