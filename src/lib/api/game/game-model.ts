import { Entity } from '@berglund/firebase';
import { Area } from '../auth/user-model';
import { Lobby } from '../lobby/lobby-model';

export interface Game extends Entity {
  lobby: Lobby;
  gameName: string;
  hostNick: string;
  players: Player[];
}

export interface Player {
  nick: string;
  areas: Area[];
}
