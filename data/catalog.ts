export type Episode = {
  id: string;
  seriesSlug: string;
  season: number;
  episode: number;
  title: string;
  label: string;
  description: string;
  thumbnail: string;
  badge?: string;
  video: {
    provider: 'r2';
    playbackId: string;
    available: boolean;
  };
};

export type Series = {
  slug: string;
  title: string;
  shortTitle: string;
  country: string;
  language: string;
  genres: string[];
  status: string;
  description: string;
  heroDesktop: string;
  heroMobile: string;
};

export const series: Series = {
  slug: 'fatih-sultan-mehmet',
  title: 'Mehmed: Sultan of Conquests',
  shortTitle: 'Fatih Sultan Mehmet',
  country: 'Turkey',
  language: 'Turkish',
  genres: ['Historical', 'Drama', 'Action'],
  status: 'Season 4',
  description:
    'The epic story of Sultan Mehmed II unfolds through conquest, strategy, loyalty and ambition at a turning point in history.',
  heroDesktop: '/images/fatih-hero-desktop.webp',
  heroMobile: '/images/fatih-hero-mobile.webp',
};

export const seriesList: Series[] = [series];

export const episodes: Episode[] = [
  {
    id: 'fatih-s4-e1',
    seriesSlug: series.slug,
    season: 4,
    episode: 1,
    title: 'Episode 1',
    label: 'Season 4 Premiere',
    description:
      'Season 4 opens a new chapter in the story of Fatih Sultan Mehmet. Watch the complete episode through the official licensed source.',
    thumbnail: '/images/fatih-s4-e01.webp',
    badge: 'PREMIERE',
    video: {
      provider: 'r2',
      playbackId: 'fatih-s4-e1',
      available: true,
    },
  },
  {
    id: 'fatih-s4-e2',
    seriesSlug: series.slug,
    season: 4,
    episode: 2,
    title: 'Episode 2',
    label: 'The Story Continues',
    description:
      'The journey continues in Season 4, Episode 2. Watch the complete episode through the official licensed source.',
    thumbnail: '/images/fatih-s4-e02.webp',
    video: {
      provider: 'r2',
      playbackId: 'fatih-s4-e2',
      available: true,
    },
  },
  {
    id: 'fatih-s4-e3',
    seriesSlug: series.slug,
    season: 4,
    episode: 3,
    title: 'Episode 3',
    label: 'A New Order',
    description:
      'A sealed command and a dangerous new turn push Mehmed toward the next stage of his campaign.',
    thumbnail: '/images/fatih-s4-e03.webp',
    badge: 'NEW',
    video: {
      provider: 'r2',
      playbackId: 'fatih-s4-e3',
      available: true,
    },
  },
];

export const seasons = [
  {number: 4, title: 'Season 4', episodeCount: episodes.length},
];

export function getSeries(slug: string) {
  return seriesList.find((item) => item.slug === slug);
}

export function getSeriesEpisodes(slug: string) {
  return episodes.filter((item) => item.seriesSlug === slug);
}

export function getEpisode(seriesSlug: string, season: number, episode: number) {
  return episodes.find((item) => item.seriesSlug === seriesSlug && item.season === season && item.episode === episode);
}

export function getAdjacentEpisodes(current: Episode) {
  const seriesEpisodes = getSeriesEpisodes(current.seriesSlug);
  const index = seriesEpisodes.findIndex((item) => item.id === current.id);
  return {
    previous: index > 0 ? seriesEpisodes[index - 1] : undefined,
    next: index >= 0 && index < seriesEpisodes.length - 1 ? seriesEpisodes[index + 1] : undefined,
  };
}
