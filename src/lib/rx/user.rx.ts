import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { mergeValidationErrors } from '@berglund/mixins';
import { hasLength, mergeWith, userInput, userTrigger } from '@berglund/rx';
import { AuthApi, UserApi } from '@d2qs/api';
import {
  ALWAYS,
  Area,
  DEFAULT_NICK,
  DEFAULT_REFRESH_MODE,
  DEFAULT_SHOW_HINTS,
  HintsMode,
  RefreshMode,
  Region,
  User,
} from '@d2qs/model';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import {
  debounceTime,
  map,
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

  region$ = userInput<Region>(this.getInitialProperty('region', null), [
    Validators.required,
  ]);

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

  preferences$ = combineLatest([this.region$, this.areas$, this.nick$]);

  errors$ = mergeWith(
    mergeValidationErrors,
    this.nick$.getErrors(),
    this.areas$.getErrors(),
    this.region$.getErrors()
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

  userUpdates = combineLatest([
    this.nick$,
    this.region$,
    this.areas$,
    this.refreshMode$,
    this.hintsMode$,
  ]).pipe(
    withLatestFrom(this.authApi.firebaseUserId$),
    debounceTime(0),
    switchMap(([[nick, region, areas, refreshMode, hintsMode], user]) => {
      return user
        ? this.userApi.update(user, {
            nick,
            region,
            areas,
            refreshMode,
            hintsMode: hintsMode,
          })
        : EMPTY;
    })
  );

  constructor(private authApi: AuthApi, private userApi: UserApi) {
    this.userUpdates.subscribe();
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
