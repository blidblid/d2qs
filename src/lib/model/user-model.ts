import { Entity } from '@berglund/firebase';

export interface Preferences {
  areas: Area[];
  region: Region;
  nick: string;
  refreshMode: RefreshMode;
}

export interface User extends Entity, Preferences {
  id: string;
  gameId?: string;
}

export const FALLBACK_NICK = '';

export type Region = 'eu' | 'us' | 'asia';
export const EU = 'eu';
export const US = 'us';
export const ASIA = 'asia';
export const FALLBACK_REGION = EU;
export const REGION_LOCALE = {
  [EU]: 'EU',
  [US]: 'US',
  [ASIA]: 'Asia',
};
export const ALL_REGIONS = Object.keys(REGION_LOCALE) as Region[];

export type Area =
  | 'ancient_tunnels'
  | 'andariel'
  | 'arcane_sanctuary'
  | 'baal'
  | 'cow'
  | 'diablo'
  | 'countess'
  | 'lower_kurast'
  | 'mausoleum'
  | 'nihlathak'
  | 'mephisto'
  | 'pindleskin'
  | 'pit'
  | 'river_of_flame'
  | 'tombs'
  | 'travincal'
  | 'tristram'
  | 'worldstone_keep';
export const ANCIENT_TUNNELS = 'ancient_tunnels';
export const ANDARIEL = 'andariel';
export const ARCANE_SANCTUARY = 'arcane_sanctuary';
export const BAAL = 'baal';
export const COW = 'cow';
export const DIABLO = 'diablo';
export const COUNTESS = 'countess';
export const LOWER_KURAST = 'lower_kurast';
export const MAUSOLEUM = 'mausoleum';
export const NIHLATHAK = 'nihlathak';
export const MEPHISTO = 'mephisto';
export const PINDLESKIN = 'pindleskin';
export const PIT = 'pit';
export const RIVER_OF_FLAME = 'river_of_flame';
export const TOMBS = 'tombs';
export const TRAVINCAL = 'travincal';
export const TRISTRAM = 'tristram';
export const WORLDSTONE_KEEP = 'worldstone_keep';
export const AREA_LOCALE: Record<Area, string> = {
  [ANCIENT_TUNNELS]: 'Ancient Tunnels',
  [ANDARIEL]: 'Andariel',
  [ARCANE_SANCTUARY]: 'Arcane Sanctuary',
  [BAAL]: 'Baal',
  [COW]: 'Cow',
  [DIABLO]: 'Diablo',
  [COUNTESS]: 'Countess',
  [LOWER_KURAST]: 'Lower Kurast',
  [MAUSOLEUM]: 'Mausoleum',
  [NIHLATHAK]: 'Nihlathak',
  [MEPHISTO]: 'Mephisto',
  [PINDLESKIN]: 'Pindleskin',
  [PIT]: 'Pit',
  [RIVER_OF_FLAME]: 'River of Flame',
  [TOMBS]: 'Tombs',
  [TRAVINCAL]: 'Travincal',
  [TRISTRAM]: 'Tristram',
  [WORLDSTONE_KEEP]: 'Worldstone Keep',
};
const RUN_ONLY_AREAS: Area[] = [TOMBS, TRISTRAM];
const AREAS = Object.keys(AREA_LOCALE) as Area[];
export const RUN_AREAS: Area[] = [BAAL, DIABLO, COW, ...RUN_ONLY_AREAS];
export const FARM_AREAS = AREAS.filter(
  (area: Area) => !RUN_ONLY_AREAS.includes(area)
);

export type RefreshMode = 'auto' | 'manual';
export const AUTO = 'auto';
export const MANUAL = 'manual';
export const REFRESH_MODE_LOCALE = {
  [AUTO]: 'Auto',
  [MANUAL]: 'Manual',
};
export const FALLBACK_REFRESH_MODE = AUTO;
