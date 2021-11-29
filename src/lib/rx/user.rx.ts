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
} from '@d2qs/model';
import { combineLatest, EMPTY } from 'rxjs';
import { debounceTime, map, switchMap, withLatestFrom } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserRx {
  nick$ = userInput(this.userService.getInitialProperty('nick', DEFAULT_NICK), [
    Validators.required,
    Validators.minLength(2),
  ]);

  region$ = userInput<Region>(
    this.userService.getInitialProperty('region', DEFAULT_REGION),
    [Validators.required]
  );

  areas$ = userInput<Area[]>(this.userService.getInitialProperty('areas', []), [
    Validators.required,
    Validators.minLength(3),
  ]);

  refreshMode$ = userInput<RefreshMode>(
    this.userService.getInitialProperty('refreshMode', DEFAULT_REFRESH_MODE)
  );

  errors$ = mergeWith(
    mergeValidationErrors,
    this.nick$.getErrors(),
    this.region$.getErrors(),
    this.areas$.getErrors()
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
    withLatestFrom(this.authService.firebaseUser$),
    switchMap(([[nick, region, areas], user]) => {
      return user
        ? this.userService.update(user.uid, { nick, region, areas })
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
}
