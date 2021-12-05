import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { mergeValidationErrors } from '@berglund/mixins';
import { hasLength, mergeWith, userInput, userTrigger } from '@berglund/rx';
import { AuthApi, QueryApiFactory, UserApi } from '@d2qs/api';
import {
  ALWAYS,
  Area,
  DEFAULT_NICK,
  DEFAULT_PLATFORM,
  DEFAULT_REFRESH_MODE,
  DEFAULT_REGION,
  DEFAULT_SHOW_HINTS,
  HintsMode,
  Platform,
  RefreshMode,
  Region,
  User,
} from '@d2qs/model';
import { combineLatest, EMPTY, merge, Observable, of } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserRx {
  nick$ = userInput(this.getInitialProperty('nick', DEFAULT_NICK), [
    Validators.required,
    Validators.minLength(2),
  ]);

  region$ = userInput<Region>(
    this.getInitialProperty('region', DEFAULT_REGION),
    [Validators.required]
  );

  platform$ = userInput<Platform>(
    this.getInitialProperty('platform', DEFAULT_PLATFORM),
    [Validators.required]
  );

  switchFriendCode$ = userInput<string>(
    this.getInitialProperty('switchFriendCode', ''),
    [Validators.required]
  );

  playStationId$ = userInput<string>(
    this.getInitialProperty('playStationId', ''),
    [Validators.required]
  );

  xboxGamertag$ = userInput<string>(
    this.getInitialProperty('xboxGamertag', ''),
    [Validators.required]
  );

  areas$ = userInput<Area[]>(this.getInitialProperty('areas', []), [
    Validators.required,
    Validators.minLength(3),
  ]);

  refreshMode$ = userInput<RefreshMode>(
    this.getInitialProperty('refreshMode', DEFAULT_REFRESH_MODE)
  );

  hintsMode$ = userInput<HintsMode>(
    this.getInitialProperty('hintsMode', DEFAULT_SHOW_HINTS)
  );

  private platformPreferences$ = combineLatest([
    this.platform$,
    this.switchFriendCode$.pipe(startWith('')),
    this.playStationId$.pipe(startWith('')),
    this.xboxGamertag$.pipe(startWith('')),
  ]);

  preferences$ = combineLatest([
    this.region$,
    this.areas$,
    this.nick$,
    this.platformPreferences$,
  ]);

  errors$ = mergeWith(
    mergeValidationErrors,
    this.nick$.getErrors(),
    this.areas$.getErrors(),
    this.region$.getErrors(),
    this.platform$.pipe(
      switchMap((platform) => {
        if (platform === 'pc') {
          return of(null);
        } else if (platform === 'switch') {
          return this.switchFriendCode$.getErrors();
        } else if (platform === 'ps') {
          return this.playStationId$.getErrors();
        } else {
          return this.xboxGamertag$.getErrors();
        }
      })
    )
  );

  hasErrors$ = this.errors$.pipe(hasLength());

  errorHint$ = this.hasErrors$.pipe(
    map((hasErrors) => {
      return hasErrors ? 'Add preferences before queueing' : '';
    })
  );

  signUp$ = userTrigger();
  signIn$ = userTrigger();
  signOut$ = userTrigger();

  queryApi$ = this.authApi.firebaseUserId$.pipe(
    filter((userId) => userId !== null),
    switchMap(() => {
      return combineLatest([this.region$, this.platform$]).pipe(
        debounceTime(0),
        map(([region, platform]) => {
          return this.queryApiFactory.getApi(region, platform);
        })
      );
    }),
    shareReplay(1)
  );

  private userUpdates$ = combineLatest([
    this.nick$,
    this.region$,
    this.areas$,
    this.refreshMode$,
    this.hintsMode$,
    this.platformPreferences$,
  ]).pipe(
    debounceTime(0),
    withLatestFrom(this.authApi.firebaseUserId$),
    switchMap(
      ([
        [
          nick,
          region,
          areas,
          refreshMode,
          hintsMode,
          [platform, switchFriendCode, playStationId, xboxGamertag],
        ],
        user,
      ]) => {
        return user
          ? this.userApi.update(user, {
              nick,
              region,
              platform,
              areas,
              hintsMode,
              refreshMode,
              switchFriendCode,
              playStationId,
              xboxGamertag,
            })
          : EMPTY;
      }
    )
  );

  private queryDeletion$ = this.queryApi$.pipe(
    withLatestFrom(this.authApi.firebaseUserId$),
    switchMap(([queryApi, userId]) => {
      return userId ? queryApi.delete(userId) : EMPTY;
    })
  );

  constructor(
    private authApi: AuthApi,
    private userApi: UserApi,
    private queryApiFactory: QueryApiFactory
  ) {
    merge(this.userUpdates$, this.queryDeletion$).subscribe();
  }

  getHint(hint: string): Observable<string> {
    return this.hintsMode$.pipe(
      map((hintsMode) => (hintsMode === ALWAYS ? hint : ''))
    );
  }

  private getInitialProperty<T extends keyof User>(
    property: T,
    defaultValue: User[T]
  ): Observable<User[T]> {
    return this.authApi.firebaseUserId$.pipe(
      switchMap((userId) => {
        return userId
          ? this.userApi.getProperty(userId, property).pipe(
              map((property) => property ?? defaultValue),
              take(1)
            )
          : of(defaultValue);
      })
    );
  }
}
