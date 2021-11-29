import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { Game } from '../../model/game-model';

@Injectable({ providedIn: 'root' })
export class GameService extends CrudApi<Game> {
  constructor(protected override injector: Injector) {
    super(injector, 'games');
  }
}
