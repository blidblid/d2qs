import { Injectable } from '@angular/core';
import { GameRx } from './game.rx';
import { LobbyRx } from './lobby.rx';
import { QueryRx } from './query.rx';
import { UserRx } from './user.rx';

@Injectable({ providedIn: 'root' })
export class Rx {
  constructor(
    public game: GameRx,
    public lobby: LobbyRx,
    public user: UserRx,
    public query: QueryRx
  ) {}
}
