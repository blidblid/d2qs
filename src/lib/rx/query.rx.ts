import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Validators } from '@angular/forms';
import {
  hasLength,
  triggeredUnflatten,
  userInput,
  userTrigger,
} from '@berglund/rx';
import { AuthService, QueryService } from '@d2qs/api';
import {
  Act,
  ACT_1,
  Area,
  BAAL,
  Difficulty,
  FARM,
  HELL,
  Query,
  Quest,
  QUEST_1,
  Type,
} from '@d2qs/model';
import firebase from 'firebase/compat/app';
import { combineLatest, EMPTY, merge, Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { UserRx } from './user.rx';

@Injectable({ providedIn: 'root' })
export class QueryRx {
  difficulty$ = userInput<Difficulty>(of(HELL), [Validators.required]);
  type$ = userInput<Type>(of(FARM), [Validators.required]);
  act$ = userInput<Act>(of(ACT_1));
  quest$ = userInput<Quest>(of(QUEST_1));
  runArea$ = userInput<Area>(of(BAAL));

  maxPlayers$ = userInput<number>(of(8), [
    Validators.required,
    Validators.min(1),
    Validators.max(8),
  ]);

  queueTrigger$ = userTrigger();
  stopTrigger$ = userTrigger();

  errors$ = this.maxPlayers$.getErrors();
  hasErrors$ = this.errors$.pipe(hasLength());

  query$: Observable<Query> = combineLatest([
    combineLatest([
      this.act$,
      this.quest$,
      this.runArea$,
      this.type$,
      this.difficulty$,
      this.maxPlayers$,
    ]),
    this.userRx.region$,
    this.userRx.areas$,
    this.userRx.nick$,
    this.authService.firebaseUser$,
  ]).pipe(
    map(
      ([
        [act, quest, runArea, type, difficulty, maxPlayers],
        region,
        areas,
        nick,
        user,
      ]) =>
        user
          ? ({
              act,
              quest,
              runArea,
              type,
              region,
              difficulty,
              maxPlayers,
              areas,
              nick,
              playerId: user.uid,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
            } as Query)
          : null
    ),
    filter((query): query is Query => query !== null)
  );

  private post$ = triggeredUnflatten(
    this.queueTrigger$,
    (query, user) => {
      return user ? this.queryService.set(user.uid, query) : EMPTY;
    },
    switchMap,
    this.query$,
    this.authService.firebaseUser$
  );

  private leave$ = triggeredUnflatten(
    this.stopTrigger$,
    (user) => (user ? this.queryService.delete(user.uid) : EMPTY),
    switchMap,
    this.authService.firebaseUser$
  );

  private onDisconnect$ = this.authService.firebaseUser$.pipe(
    mergeMap((user) => {
      return user
        ? this.angularFireDatabase.database
            .ref(`queries/${user.uid}`)
            .onDisconnect()
            .remove()
        : EMPTY;
    })
  );

  constructor(
    private angularFireDatabase: AngularFireDatabase,
    private authService: AuthService,
    private queryService: QueryService,
    private userRx: UserRx
  ) {
    merge(this.post$, this.leave$, this.onDisconnect$).subscribe();
  }
}
