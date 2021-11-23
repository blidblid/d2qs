import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { userInput, userTrigger } from '@berglund/rx';
import {
  ALL_AREAS,
  Area,
  FALLBACK_NICK,
  FALLBACK_REFRESH_MODE,
  FALLBACK_REGION,
  RefreshMode,
  Region,
  UserService,
  WORLDSTONE_KEEP,
} from '@d2queue/api';
import { combineLatest, EMPTY } from 'rxjs';
import { debounceTime, switchMap, withLatestFrom } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserRx {
  nick$ = userInput(
    this.userService.getInitialProperty('nick', FALLBACK_NICK),
    [(Validators.required, Validators.minLength(2))]
  );

  region$ = userInput<Region>(
    this.userService.getInitialProperty('region', FALLBACK_REGION)
  );

  areas$ = userInput<Area[]>(
    this.userService.getInitialProperty(
      'areas',
      ALL_AREAS.filter((area) => area !== WORLDSTONE_KEEP)
    )
  );

  refreshMode$ = userInput<RefreshMode>(
    this.userService.getInitialProperty('refreshMode', FALLBACK_REFRESH_MODE)
  );

  signUp$ = userTrigger();
  signIn$ = userTrigger();
  signOut$ = userTrigger();

  userUpdates = combineLatest([this.nick$, this.region$, this.areas$]).pipe(
    withLatestFrom(this.userService.user$),
    switchMap(([[nick, region, areas], user]) => {
      return user
        ? this.userService.update(user.id, { nick, region, areas })
        : EMPTY;
    }),
    debounceTime(1000)
  );

  constructor(private userService: UserService) {
    this.userUpdates.subscribe();
  }
}
