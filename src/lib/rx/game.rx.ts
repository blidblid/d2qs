import { Injectable } from '@angular/core';
import { triggeredUnflatten, userTrigger } from '@berglund/rx';
import {
  ACT_LOCALE,
  AREA_LOCALE,
  AuthService,
  DIFFICULTY_LOCALE,
  Game,
  GameService,
  QUEST_LOCALE,
  TYPE_LOCALE,
  UserService,
} from '@d2queue/api';
import firebase from 'firebase/compat/app';
import { from, of } from 'rxjs';
import { filter, map, pluck, shareReplay, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GameRx {
  game$ = this.authService.firebaseUser$.pipe(
    filter((user): user is firebase.User => user !== null),
    switchMap((user) => this.userService.getProperty(user.uid, 'gameId')),
    switchMap((gameId) => (gameId ? this.gameService.get(gameId) : of(null))),
    shareReplay(1)
  );

  contentCopyTrigger$ = userTrigger();

  truthyGame$ = this.game$.pipe(filter((game): game is Game => !!game));
  name$ = this.truthyGame$.pipe(pluck('gameName'));
  hostNick$ = this.truthyGame$.pipe(pluck('hostNick'));

  difficulty$ = this.truthyGame$.pipe(
    pluck('lobby', 'difficulty'),
    map((difficulty) => DIFFICULTY_LOCALE[difficulty])
  );

  type$ = this.truthyGame$.pipe(pluck('lobby', 'type'));
  localizedType$ = this.type$.pipe(map((type) => TYPE_LOCALE[type]));

  act$ = this.truthyGame$.pipe(
    pluck('lobby', 'act'),
    map((act) => (act ? ACT_LOCALE[act] : ''))
  );

  quest$ = this.truthyGame$.pipe(
    pluck('lobby', 'quest'),
    map((quest) => (quest ? QUEST_LOCALE[quest] : ''))
  );

  runArea$ = this.truthyGame$.pipe(
    pluck('lobby', 'runArea'),
    map((runArea) => (runArea ? AREA_LOCALE[runArea] : ''))
  );

  private contentCopy$ = triggeredUnflatten(
    this.contentCopyTrigger$,
    (content: string) => from(navigator.clipboard.writeText(content)),
    switchMap,
    this.name$
  );

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private userService: UserService
  ) {
    this.contentCopy$.subscribe();
  }
}
