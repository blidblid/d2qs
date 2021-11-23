import { Injectable } from '@angular/core';
import { userTrigger } from '@berglund/rx';
import {
  AUTO_REFRESH_TIME,
  FALLBACK_NICK,
  FALLBACK_REGION,
  Lobby,
  Query,
  QueryService,
  REFRESH_THROTTLE_TIME,
  toLobbies,
  UserService,
} from '@d2queue/api';
import firebase from 'firebase/compat/app';
import { combineLatest, EMPTY, interval, merge } from 'rxjs';
import {
  filter,
  map,
  share,
  startWith,
  switchMap,
  take,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { QueryRx } from '.';
import { UserRx } from './user.rx';

@Injectable({ providedIn: 'root' })
export class LobbyRx {
  refreshTrigger$ = userTrigger();
  joinTrigger$ = userTrigger<Lobby>();

  autoRefresh$ = interval(AUTO_REFRESH_TIME).pipe(share());

  refresh$ = this.userRx.refreshMode$.pipe(
    switchMap((refreshMode) => {
      return refreshMode === 'manual'
        ? this.refreshTrigger$
        : merge(this.refreshTrigger$, this.autoRefresh$);
    }),
    throttleTime(REFRESH_THROTTLE_TIME)
  );

  private lobbies = merge(
    this.refresh$,
    this.queryRx.queueTrigger$,
    this.queryRx.stopTrigger$,
    this.joinTrigger$
  ).pipe(
    startWith(null),
    switchMap(() => {
      return this.queryService.getAll().pipe(
        filter((queries): queries is Query[] => Array.isArray(queries)),
        map(toLobbies),
        take(2)
      );
    })
  );

  regionLobbies$ = combineLatest([this.lobbies, this.userRx.region$]).pipe(
    map(([lobbies, region]) => {
      return lobbies.filter((lobby) => lobby.region === region);
    })
  );

  joinedLobby$ = this.joinTrigger$.pipe(
    withLatestFrom(this.userService.user$),
    switchMap(([lobby, user]) => {
      return user
        ? this.queryService.set(user.id, {
            act: lobby.act,
            type: lobby.type,
            playerId: user.id,
            quest: lobby.quest,
            areas: lobby.areas,
            runArea: lobby.runArea,
            difficulty: lobby.difficulty,
            maxPlayers: lobby.maxPlayers,
            nick: user.nick ?? FALLBACK_NICK,
            region: user.region ?? FALLBACK_REGION,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
          })
        : EMPTY;
    })
  );

  constructor(
    private queryService: QueryService,
    private userRx: UserRx,
    private userService: UserService,
    private queryRx: QueryRx
  ) {
    this.joinedLobby$.subscribe();
  }
}
