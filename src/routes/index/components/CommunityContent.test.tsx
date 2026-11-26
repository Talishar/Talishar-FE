import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { vi } from 'vitest';
import CommunityContent from './CommunityContent';
import {
  fetchDiscordContentCarousel,
  ContentVideo
} from 'services/contentService';

vi.mock('services/contentService', () => ({
  fetchDiscordContentCarousel: vi.fn(),
  peekDiscordContentCarousel: vi.fn(() => undefined)
}));
vi.mock('components/ads/AdUnit', () => ({
  AdUnit: ({ placement }: { placement: string }) => <div data-ad={placement} />
}));

const video = (index: number): ContentVideo => ({
  videoId: `video-${index}`,
  type: 'metafy',
  title: `Community guide ${index}`,
  author: 'Author',
  timestamp: '2026-10-07T12:00:00Z',
  messageUrl: 'https://example.com',
  url: 'https://example.com'
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

it('keeps the cards and CTA mounted while the feed resolves', async () => {
  let resolveFeed!: (videos: ContentVideo[]) => void;
  vi.mocked(fetchDiscordContentCarousel).mockReturnValue(
    new Promise((resolve) => {
      resolveFeed = resolve;
    })
  );
  render(<CommunityContent />);
  const featured = screen.getByTestId('community-featured');
  const secondary = screen.getByTestId('community-secondary');
  const cta = screen.getByRole('link', { name: 'Join Discord' });
  expect(screen.getByRole('status')).toBeInTheDocument();
  await act(async () => {
    resolveFeed(Array.from({ length: 7 }, (_, index) => video(index)));
  });
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByTestId('community-featured')).toBe(featured);
  expect(screen.getByTestId('community-secondary')).toBe(secondary);
  expect(screen.getByRole('link', { name: 'Join Discord' })).toBe(cta);
  expect(
    screen.getByRole('heading', { name: 'Community guide 0' })
  ).toBeInTheDocument();
});

it.each([0, 1, 2])(
  'handles a feed with %i items without removing its reserved cards',
  async (count) => {
    vi.mocked(fetchDiscordContentCarousel).mockResolvedValue(
      Array.from({ length: count }, (_, index) => video(index))
    );
    render(<CommunityContent />);
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('community-featured')).toBeInTheDocument();
    expect(screen.getByTestId('community-secondary')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Join Discord' })
    ).toBeInTheDocument();
    if (count > 0)
      expect(
        screen.getByRole('heading', { name: 'Community guide 0' })
      ).toBeInTheDocument();
  }
);

it('shows video titles for link-only posts in the cards and the selectable list', async () => {
  vi.mocked(fetchDiscordContentCarousel).mockResolvedValue([
    {
      ...video(0),
      type: 'youtube',
      title: '<https://youtu.be/abcdefghijk>',
      mediaTitle: 'A Day at My Local Armory'
    },
    {
      ...video(1),
      type: 'youtube',
      title: 'https://youtu.be/lmnopqrstuv'
    },
    {
      ...video(2),
      type: 'youtube',
      title: '<https://youtu.be/12345678901>',
      mediaTitle: 'Levia Deck Tech'
    },
    {
      ...video(3),
      type: 'youtube',
      title: 'Sunday Blitz recap <https://youtu.be/12345678902>'
    }
  ]);

  render(<CommunityContent />);

  expect(
    await screen.findByRole('heading', { name: 'A Day at My Local Armory' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'YouTube video' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Sunday Blitz recap/ })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Levia Deck Tech/ }));

  const featured = screen.getByTestId('community-featured');
  expect(
    screen.getByRole('heading', { name: 'Levia Deck Tech' })
  ).toBeInTheDocument();
  expect(featured.querySelector('iframe')).toHaveAttribute(
    'title',
    'Levia Deck Tech'
  );
});

it('keeps the current feed visible while refreshing and tolerates a shorter replacement', async () => {
  vi.useFakeTimers();
  let refresh!: (videos: ContentVideo[]) => void;
  vi.mocked(fetchDiscordContentCarousel)
    .mockResolvedValueOnce(
      Array.from({ length: 7 }, (_, index) => video(index))
    )
    .mockReturnValueOnce(
      new Promise((resolve) => {
        refresh = resolve;
      })
    );
  render(<CommunityContent />);
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.click(
    screen.getByRole('button', { name: /Community guide 6.*Guide/ })
  );
  expect(
    screen.getByRole('heading', { name: 'Community guide 6' })
  ).toBeInTheDocument();
  await act(async () => {
    vi.advanceTimersByTime(30 * 60 * 1000);
  });
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Community guide 6' })
  ).toBeInTheDocument();
  await act(async () => {
    refresh([video(0), video(1), video(2)]);
  });
  expect(
    screen.getByRole('heading', { name: 'Community guide 0' })
  ).toBeInTheDocument();
});
