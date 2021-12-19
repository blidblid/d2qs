import { Entity } from '@berglund/firebase';

export interface Preferences {
  areas: Area[];
  region: Region;
  platform: Platform;
  ladder: Ladder;
  nick: string;
  switchFriendCode?: string;
  playStationId?: string;
  xboxGamertag?: string;
}

export interface Config {
  refreshMode: RefreshMode;
  hintsMode: HintsMode;
}

export interface User extends Entity, Config, Preferences {
  id: string;
  gameId?: string;
}

export const DEFAULT_NICK = '';

export type Region = typeof EU | typeof US | typeof ASIA;
export const EU = 'eu';
export const US = 'us';
export const ASIA = 'asia';
export const REGION_LOCALE = {
  [EU]: 'EU',
  [US]: 'US',
  [ASIA]: 'Asia',
};
export const DEFAULT_REGION = EU;
export const ALL_REGIONS = [EU, US, ASIA];

export type Platform = typeof PC | typeof SWITCH | typeof PS | typeof XBOX;
export const PC = 'pc';
export const SWITCH = 'switch';
export const PS = 'ps';
export const XBOX = 'xbox';
export const PLATFORM_LOCALE = {
  [PC]: 'PC',
  [SWITCH]: 'Switch',
  [PS]: 'PlayStation',
  [XBOX]: 'Xbox',
};
export const PLATFORM_ID_LOCALE = {
  [SWITCH]: 'Switch friend code',
  [PS]: 'PlayStation id',
  [XBOX]: 'Xbox gamertag',
};
export const DEFAULT_PLATFORM = PC;
export const ALL_PLATFORMS = [PC, SWITCH, PS, XBOX];

export type Ladder =
  | typeof SC_LADDER
  | typeof HC_LADDER
  | typeof SC_NON_LADDER
  | typeof HC_NON_LADDER;
export const SC_LADDER = 'scl';
export const HC_LADDER = 'hcl';
export const SC_NON_LADDER = 'scnl';
export const HC_NON_LADDER = 'hcnl';
export const LADDER_LOCALE = {
  [SC_LADDER]: 'Softcore ladder',
  [HC_LADDER]: 'Hardcore ladder',
  [SC_NON_LADDER]: 'Softcore non-ladder',
  [HC_NON_LADDER]: 'Hardcore non-ladder',
};
export const DEFAULT_LADDER = SC_NON_LADDER;
export const ALL_LADDERS = [SC_LADDER, HC_LADDER, SC_NON_LADDER, HC_NON_LADDER];

export type Area =
  | typeof ANCIENT_TUNNELS
  | typeof ANDARIEL
  | typeof ARCANE_SANCTUARY
  | typeof BAAL
  | typeof COW
  | typeof DIABLO
  | typeof COUNTESS
  | typeof LOWER_KURAST
  | typeof MAUSOLEUM
  | typeof NIHLATHAK
  | typeof MEPHISTO
  | typeof PINDLESKIN
  | typeof PIT
  | typeof RIVER_OF_FLAME
  | typeof TOMBS
  | typeof TRAVINCAL
  | typeof TRISTRAM
  | typeof WORLDSTONE_KEEP;
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
export const TOMBS = 'tomb';
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
  [TOMBS]: 'Tomb',
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

export type RefreshMode = typeof AUTO | typeof MANUAL;
export const AUTO = 'auto';
export const MANUAL = 'manual';
export const REFRESH_MODE_LOCALE = {
  [AUTO]: 'Auto',
  [MANUAL]: 'Manual',
};
export const DEFAULT_REFRESH_MODE = AUTO;

export type HintsMode = typeof ALWAYS | typeof NEVER;
export const ALWAYS = 'always';
export const NEVER = 'never';
export const DEFAULT_SHOW_HINTS: HintsMode = ALWAYS;
export const HINTS_MODE_LOCALE: Record<HintsMode, string> = {
  [ALWAYS]: 'Always show',
  [NEVER]: 'Never show',
};
