import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Validators } from '@angular/forms';
import { mergeValidationErrors } from '@berglund/mixins';
import {
  hasLength,
  mergeWith,
  triggeredUnflatten,
  userInput,
  userTrigger,
} from '@berglund/rx';
import { AuthApi } from '@d2qs/api';
import {
  Act,
  ACT_1,
  ACT_4,
  Area,
  BAAL,
  Difficulty,
  FARM,
  HELL,
  Query,
  Quest,
  QUEST_1,
  QUEST_4,
  Type,
} from '@d2qs/model';
import firebase from 'firebase/compat/app';
import { combineLatest, EMPTY, interval, merge, Observable, of } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  mergeMap,
  share,
  skip,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { UserRx } from './user.rx';

@Injectable({ providedIn: 'root' })
export class QueryRx {
  difficulty$ = userInput<Difficulty>(of(HELL), [Validators.required]);
  type$ = userInput<Type>(of(FARM), [Validators.required]);
  act$ = userInput<Act>(of(ACT_1));
  quest$ = userInput<Quest>(
    this.act$.pipe(
      filter((act) => act === ACT_4),
      map(() => QUEST_4),
      startWith(QUEST_1)
    )
  );
  runArea$ = userInput<Area>(of(BAAL));

  maxPlayers$ = userInput<number>(of(8), [
    Validators.required,
    Validators.min(1),
    Validators.max(8),
  ]);

  maxLevel$ = userInput<number>(of(99), [
    Validators.required,
    Validators.min(1),
    Validators.max(99),
  ]);

  queueTrigger$ = userTrigger();
  leaveTrigger$ = userTrigger();

  errors$ = mergeWith(
    mergeValidationErrors,
    this.difficulty$.getErrors(),
    this.type$.getErrors(),
    this.maxPlayers$.getErrors(),
    this.maxLevel$.getErrors()
  ).pipe(debounceTime(0));

  hasErrors$ = this.errors$.pipe(hasLength());

  private queryForm$ = combineLatest([
    this.act$,
    this.quest$,
    this.runArea$,
    this.maxLevel$,
    this.type$,
    this.difficulty$,
    this.maxPlayers$,
  ]);

  query$: Observable<Query> = combineLatest([
    this.queryForm$,
    this.userRx.preferences$,
    this.authApi.firebaseUserId$,
  ]).pipe(
    map(
      ([
        [act, quest, runArea, maxLevel, type, difficulty, maxPlayers],
        [
          region,
          areas,
          nick,
          [platform, switchFriendCode, playStationId, xboxGamertag],
        ],
        user,
      ]) =>
        user
          ? ({
              act,
              quest,
              runArea,
              maxLevel,
              type,
              region,
              difficulty,
              maxPlayers,
              areas,
              nick,
              platform,
              switchFriendCode,
              playStationId,
              xboxGamertag,
              playerId: user,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
            } as Query)
          : null
    ),
    filter((query): query is Query => query !== null)
  );

  private activeQuery$ = combineLatest([
    this.authApi.firebaseUserId$,
    this.userRx.queryApi$,
  ]).pipe(
    switchMap(([user, queryApi]) => (user ? queryApi.get(user) : of(null))),
    share(),
    startWith(null)
  );

  queueing$ = this.activeQuery$.pipe(
    map((activeQuery) => activeQuery !== null)
  );

  queueTime$ = this.queueing$.pipe(
    switchMap((queueing) => {
      return queueing ? interval(1000).pipe(startWith(0)) : of(null);
    }),
    map((s) => {
      return s === null
        ? s
        : {
            minutes: `${Math.floor(s / 60)}`,
            seconds: `${s % 60}`.padStart(2, '0'),
          };
    })
  );

  typeHint$ = this.type$.pipe(
    switchMap((type) => {
      if (type === 'farm') {
        return this.userRx.getHint('Split up and farm.');
      }

      if (type === 'run') {
        return this.userRx.getHint('Farm together.');
      }

      if (type === 'duel') {
        return this.userRx.getHint('To battle!');
      }

      return of('');
    })
  );

  private post$ = triggeredUnflatten(
    this.queueTrigger$,
    (query, user, queryApi) => {
      return user ? queryApi.set(user, query) : EMPTY;
    },
    switchMap,
    this.query$,
    this.authApi.firebaseUserId$,
    this.userRx.queryApi$
  );

  private leave$ = triggeredUnflatten(
    merge(
      this.leaveTrigger$,
      this.queryForm$.pipe(skip(1)), // skip initial query form
      this.userRx.preferences$.pipe(skip(2)) // skip initial preferences and initial request
    ),
    (user, queryApi) => (user ? queryApi.delete(user) : EMPTY),
    switchMap,
    this.authApi.firebaseUserId$,
    this.userRx.queryApi$
  );

  private onDisconnect$ = combineLatest([
    this.authApi.firebaseUserId$,
    this.userRx.region$,
    this.userRx.platform$,
  ]).pipe(
    mergeMap(([user, region, platform]) => {
      return user && region && platform
        ? this.angularFireDatabase.database
            .ref([region, platform, user].join('/'))
            .onDisconnect()
            .remove()
        : EMPTY;
    })
  );

  constructor(
    private angularFireDatabase: AngularFireDatabase,
    private authApi: AuthApi,
    private userRx: UserRx
  ) {
    merge(this.post$, this.leave$, this.onDisconnect$).subscribe();
  }
}
