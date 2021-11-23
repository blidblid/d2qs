import { Query } from '../query/query-model';

export interface Lobby extends Omit<Query, 'nick' | 'timestamp' | 'playerId'> {
  queries: Query[];
}

export const AUTO_REFRESH_TIME = 10000;
export const REFRESH_THROTTLE_TIME = 1000;
