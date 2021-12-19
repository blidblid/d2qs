import { Injectable } from '@angular/core';
import { userTrigger } from '@berglund/rx';
import { AuthApi, UserApi } from '@d2qs/api';
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
  debounceTime,
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

  private queries$ = this.userRx.queryApi$.pipe(
    switchMap((queryApi) => queryApi.getAll()),
    filter((queries): queries is Query[] => Array.isArray(queries)),
    map(toLobbies),
    // do not refCount to keep the firebase websocket open indefinitely,
    // it should create less traffic than recreating the websocket over and over again
    shareReplay({ refCount: false, bufferSize: 1 })
  );

  private lobbies$ = merge(
    this.refresh$.pipe(map(() => 1)),
    this.queryRx.queueTrigger$.pipe(map(() => 2)),
    this.queryRx.leaveTrigger$.pipe(map(() => 2)),
    this.joinTrigger$.pipe(map(() => 2))
  ).pipe(
    startWith(1),
    switchMap((takeCount) => this.queries$.pipe(take(takeCount)))
  );

  private regionLobbies$ = combineLatest([
    this.lobbies$,
    this.authApi.firebaseUserId$,
  ]).pipe(
    map(([lobbies, user]) => {
      return lobbies.sort((lobby) => {
        return lobby.queries.some((query) => query.playerId === user) ? -1 : 1;
      });
    })
  );

  filteredLobbies$ = combineLatest([
    this.regionLobbies$,
    this.queryRx.difficulty$,
    this.queryRx.type$,
  ]).pipe(
    debounceTime(0),
    map(([regionLobbies, difficulty, type]) => {
      return regionLobbies.filter((lobby) => {
        return lobby.difficulty === difficulty && lobby.type === type;
      });
    })
  );

  joinedLobby$ = this.joinTrigger$.pipe(
    withLatestFrom(
      this.userApi.user$,
      this.authApi.firebaseUserId$,
      this.userRx.queryApi$
    ),
    switchMap(([lobby, user, userId, queryApi]) => {
      if (!user || !userId) {
        return EMPTY;
      }

      return queryApi.set(userId, {
        act: lobby.act,
        type: lobby.type,
        playerId: userId,
        quest: lobby.quest,
        runArea: lobby.runArea,
        maxLevel: lobby.maxLevel,
        difficulty: lobby.difficulty,
        maxPlayers: lobby.maxPlayers,
        platform: lobby.platform,
        ladder: lobby.ladder,
        region: lobby.region,
        areas: user.areas,
        nick: user.nick ?? DEFAULT_NICK,
        switchFriendCode: user.switchFriendCode,
        playStationId: user.playStationId,
        xboxGamertag: user.xboxGamertag,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
    })
  );

  constructor(
    private authApi: AuthApi,
    private userRx: UserRx,
    private userApi: UserApi,
    private queryRx: QueryRx
  ) {
    this.joinedLobby$.subscribe();
  }
}
