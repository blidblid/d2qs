import { Injectable } from '@angular/core';
import { userTrigger } from '@berglund/rx';
import { AuthService, QueryService, UserService } from '@d2qs/api';
import {
  AUTO_REFRESH_TIME,
  DEFAULT_NICK,
  Lobby,
  Query,
  REFRESH_THROTTLE_TIME,
  toLobbies,
} from '@d2qs/model';
import firebase from 'firebase/compat/app';
import { combineLatest, EMPTY, interval, merge } from 'rxjs';
import {
  filter,
  map,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { QueryRx } from './query.rx';
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

  private queries$ = this.queryService.getAll().pipe(
    filter((queries): queries is Query[] => Array.isArray(queries)),
    map(toLobbies),
    // do not refCount to keep the firebase websocket open indefinitely,
    // it should create less traffic then recreating the websocket over and over again
    shareReplay({ refCount: false, bufferSize: 1 })
  );

  private lobbies$ = merge(
    this.refresh$.pipe(map(() => 1)),
    this.queryRx.queueTrigger$.pipe(map(() => 2)),
    this.queryRx.cancelTrigger$.pipe(map(() => 2)),
    this.joinTrigger$.pipe(map(() => 2))
  ).pipe(
    startWith(1),
    switchMap((takeCount) => this.queries$.pipe(take(takeCount)))
  );

  regionLobbies$ = combineLatest([
    this.lobbies$,
    this.userRx.region$,
    this.authService.firebaseUser$,
  ]).pipe(
    map(([lobbies, region, user]) => {
      return lobbies
        .filter((lobby) => lobby.region === region)
        .sort((lobby) => {
          return lobby.queries.some((query) => query.playerId === user?.uid)
            ? -1
            : 1;
        });
    })
  );

  joinedLobby$ = this.joinTrigger$.pipe(
    withLatestFrom(this.userService.user$, this.authService.firebaseUser$),
    switchMap(([lobby, user, firebaseUser]) => {
      if (!user || !firebaseUser) {
        return EMPTY;
      }

      return this.queryService.set(firebaseUser.uid, {
        act: lobby.act,
        type: lobby.type,
        playerId: firebaseUser.uid,
        quest: lobby.quest,
        runArea: lobby.runArea,
        difficulty: lobby.difficulty,
        maxPlayers: lobby.maxPlayers,
        region: lobby.region,
        areas: user.areas,
        nick: user.nick ?? DEFAULT_NICK,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
    })
  );

  constructor(
    private authService: AuthService,
    private queryService: QueryService,
    private userRx: UserRx,
    private userService: UserService,
    private queryRx: QueryRx
  ) {
    this.joinedLobby$.subscribe();
  }
}
