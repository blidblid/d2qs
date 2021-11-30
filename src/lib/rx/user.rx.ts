import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { mergeValidationErrors } from '@berglund/mixins';
import { hasLength, mergeWith, userInput, userTrigger } from '@berglund/rx';
import { AuthService, UserService } from '@d2qs/api';
import {
  Area,
  DEFAULT_NICK,
  DEFAULT_REFRESH_MODE,
  DEFAULT_REGION,
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

  region$ = userInput<Region>(
    this.getInitialProperty('region', DEFAULT_REGION),
    [Validators.required]
  );

  areas$ = userInput<Area[]>(this.getInitialProperty('areas', []), [
    Validators.required,
    Validators.minLength(3),
  ]);

  refreshMode$ = userInput<RefreshMode>(
    this.getInitialProperty('refreshMode', DEFAULT_REFRESH_MODE)
  );

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

  userUpdates = combineLatest([this.nick$, this.region$, this.areas$]).pipe(
    withLatestFrom(this.authService.firebaseUserId$),
    switchMap(([[nick, region, areas], user]) => {
      return user
        ? this.userService.update(user, { nick, region, areas })
        : EMPTY;
    }),
    debounceTime(1000)
  );

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    this.userUpdates.subscribe();
  }

  private getInitialProperty<T extends keyof User>(
    property: T,
    defaultValue: User[T]
  ): Observable<User[T]> {
    return this.authService.firebaseUserId$.pipe(
      switchMap((userId) => {
        return userId
          ? this.userService.getProperty(userId, property).pipe(
              map((property) => property ?? defaultValue),
              take(1)
            )
          : of(defaultValue);
      })
    );
  }
}
