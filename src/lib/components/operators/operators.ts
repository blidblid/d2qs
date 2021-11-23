import { Injectable } from '@angular/core';
import { GameOperators } from './game.operators';
import { LobbyOperators } from './lobby.operators';
import { QueryOperators } from './query.operators';
import { UserOperators } from './user.operators';

@Injectable({ providedIn: 'root' })
export class Operators {
  constructor(
    public game: GameOperators,
    public lobby: LobbyOperators,
    public user: UserOperators,
    public query: QueryOperators
  ) {}
}
