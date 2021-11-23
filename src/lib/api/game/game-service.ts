import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { Game } from './game-model';

@Injectable({ providedIn: 'root' })
export class GameService extends CrudApi<Game> {
  constructor(protected injector: Injector) {
    super(injector, 'games');
  }
}
