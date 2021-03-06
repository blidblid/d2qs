import { Query } from './query-model';

export interface Lobby
  extends Omit<
    Query,
    | 'nick'
    | 'timestamp'
    | 'playerId'
    | 'switchFriendCode'
    | 'playStationId'
    | 'xboxGamertag'
  > {
  queries: Query[];
}

export const AUTO_REFRESH_TIME = 10000;
export const REFRESH_THROTTLE_TIME = 1000;
