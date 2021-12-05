import { Injectable } from '@angular/core';
import { triggeredUnflatten, userTrigger } from '@berglund/rx';
import { AuthApi, GameApi, UserApi } from '@d2qs/api';
import {
  ACT_LOCALE,
  AREA_LOCALE,
  DIFFICULTY_LOCALE,
  Game,
  PLATFORM_LOCALE,
  QUEST_LOCALE,
  TYPE_LOCALE,
} from '@d2qs/model';
import { from, of } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GameRx {
  game$ = this.authApi.firebaseUserId$.pipe(
    filter((user): user is string => user !== null),
    switchMap((user) => this.userApi.getProperty(user, 'gameId')),
    distinctUntilChanged(),
    switchMap((gameId) => (gameId ? this.gameApi.get(gameId) : of(null))),
    shareReplay(1)
  );

  contentCopyTrigger$ = userTrigger();

  truthyGame$ = this.game$.pipe(filter((game): game is Game => !!game));
  name$ = this.truthyGame$.pipe(pluck('gameName'));

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

  maxLevel$ = this.truthyGame$.pipe(
    pluck('lobby', 'maxLevel'),
    map((maxLevel) => maxLevel ?? 99)
  );

  private platformId$ = this.truthyGame$.pipe(pluck('lobby', 'platform'));

  platform$ = this.platformId$.pipe(
    map((platform) => PLATFORM_LOCALE[platform])
  );

  time$ = this.truthyGame$.pipe(
    pluck('timestamp'),
    map((timestamp) => new Date(timestamp).toLocaleString())
  );

  hint$ = this.truthyGame$.pipe(
    map((game) => {
      if (
        game.lobby.type !== 'farm' ||
        !Array.isArray(game.unassignedAreas) ||
        game.unassignedAreas.length === 0
      ) {
        return null;
      }

      return `Unassigned areas: ${game.unassignedAreas
        .map((area) => AREA_LOCALE[area])
        .join(', ')}.`;
    })
  );

  showGameName$ = this.platformId$.pipe(
    map((platformId) => platformId === 'pc')
  );

  private contentCopy$ = triggeredUnflatten(
    this.contentCopyTrigger$,
    (content: string) => from(navigator.clipboard.writeText(content)),
    switchMap,
    this.name$
  );

  constructor(
    private authApi: AuthApi,
    private gameApi: GameApi,
    private userApi: UserApi
  ) {
    this.contentCopy$.subscribe();
  }
}
