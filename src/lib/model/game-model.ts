import { Entity } from '@berglund/firebase';
import { Lobby } from './lobby-model';
import { Area, Preferences } from './user-model';

export interface Game extends Entity {
  lobby: Lobby;
  gameName: string;
  timestamp: number;
  players: Player[];
  unassignedAreas?: Area[];
}

export interface Player
  extends Pick<
    Preferences,
    'nick' | 'switchFriendCode' | 'playStationId' | 'xboxGamertag'
  > {
  areas?: Area[];
}
