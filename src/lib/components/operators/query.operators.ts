import { Injectable } from '@angular/core';
import {
  BergButtonComponent,
  BergInputComponent,
  BergSelectComponent,
} from '@berglund/material';
import { component } from '@berglund/mixins';
import { AuthService, QueryService } from '@d2qs/api';
import {
  Act,
  ACT_1,
  ACT_2,
  ACT_3,
  ACT_4,
  ACT_5,
  ACT_LOCALE,
  Area,
  AREA_LOCALE,
  Difficulty,
  DIFFICULTY_LOCALE,
  FARM,
  HELL,
  NIGHTMARE,
  NORMAL,
  Quest,
  QUEST,
  QUEST_1,
  QUEST_2,
  QUEST_3,
  QUEST_4,
  QUEST_5,
  QUEST_6,
  QUEST_LOCALE,
  RUN,
  RUN_AREAS,
  Type,
  TYPE_LOCALE,
} from '@d2qs/model';
import { Rx } from '@d2qs/rx';
import { combineLatest, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class QueryOperators {
  type = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Type',
      connect: this.rx.query.type$,
      data: [FARM, RUN, QUEST],
      pluckLabel: (value: Type) => TYPE_LOCALE[value],
    },
  });

  act$ = this.rx.query.type$.pipe(
    map((type) => {
      return type === QUEST
        ? component({
            component: BergSelectComponent,
            inputs: {
              label: 'Starting act',
              connect: this.rx.query.act$,
              data: [ACT_1, ACT_2, ACT_3, ACT_4, ACT_5],
              pluckLabel: (value: Act) => ACT_LOCALE[value],
            },
          })
        : null;
    })
  );

  quest$ = combineLatest([this.rx.query.type$, this.rx.query.act$]).pipe(
    map(([type, act]) => {
      if (type !== QUEST) {
        return null;
      }

      return component({
        component: BergSelectComponent,
        inputs: {
          label: 'Starting quest',
          connect: this.rx.query.quest$,
          data:
            act === ACT_4
              ? [QUEST_1, QUEST_2, QUEST_3, QUEST_4]
              : [QUEST_1, QUEST_2, QUEST_3, QUEST_4, QUEST_5, QUEST_6],
          pluckLabel: (value: Quest) => QUEST_LOCALE[value],
        },
      });
    })
  );

  runArea$ = this.rx.query.type$.pipe(
    map((type) => {
      return type === RUN
        ? component({
            component: BergSelectComponent,
            inputs: {
              label: 'Area',
              connect: this.rx.query.runArea$,
              data: RUN_AREAS,
              pluckLabel: (value: Area) => AREA_LOCALE[value],
            },
          })
        : null;
    })
  );

  difficulty = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Difficulty',
      connect: this.rx.query.difficulty$,
      data: [NORMAL, NIGHTMARE, HELL],
      pluckLabel: (value: Difficulty) => DIFFICULTY_LOCALE[value],
    },
  });

  maxPlayers = component({
    component: BergInputComponent,
    inputs: {
      label: 'Max players',
      type: 'number',
      connect: this.rx.query.maxPlayers$,
    },
  });

  queueTrigger = component({
    component: BergButtonComponent,
    inputs: {
      label: 'Queue',
      connect: this.rx.query.queueTrigger$,
      hint: this.rx.user.errorHint$,
      disabled: combineLatest([
        this.authService.isSignedIn$,
        this.rx.query.hasErrors$,
        this.rx.user.hasErrors$,
      ]).pipe(
        map(([isSignedIn, hasQueryErrors, hasUserErrors]) => {
          return !isSignedIn || hasQueryErrors || hasUserErrors;
        })
      ),
    },
  });

  cancelTrigger = component({
    component: BergButtonComponent,
    inputs: {
      label: 'Cancel',
      connect: this.rx.query.cancelTrigger$,
      type: 'cancel',
      disabled: this.authService.firebaseUser$.pipe(
        switchMap((user) => {
          return user ? this.queryService.get(user.uid) : of(null);
        }),
        map((query) => query === null),
        startWith(true)
      ),
    },
  });

  constructor(
    private rx: Rx,
    private authService: AuthService,
    private queryService: QueryService
  ) {}
}
