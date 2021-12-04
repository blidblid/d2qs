import { Entity } from '@berglund/firebase';
import { Lobby } from './lobby-model';
import { Area } from './user-model';

export interface Game extends Entity {
  lobby: Lobby;
  gameName: string;
  timestamp: number;
  players: Player[];
  unassignedAreas?: Area[];
}

export interface Player {
  nick: string;
  areas?: Area[];
}
