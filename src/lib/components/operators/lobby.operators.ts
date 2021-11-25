import { Injectable } from '@angular/core';
import { BergButtonComponent, BergTableComponent } from '@berglund/material';
import { component } from '@berglund/mixins';
import { AuthService } from '@d2qs/api';
import {
  Act,
  ACT_LOCALE,
  Area,
  AREA_LOCALE,
  Difficulty,
  DIFFICULTY_LOCALE,
  Lobby,
  Quest,
  QUEST,
  QUEST_LOCALE,
  REFRESH_THROTTLE_TIME,
  RUN,
  Type,
  TYPE_LOCALE,
} from '@d2qs/model';
import { Rx } from '@d2qs/rx';
import { interval, of } from 'rxjs';
import { delay, map, startWith, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LobbyOperators {
  refreshTrigger = component({
    component: BergButtonComponent,
    inputs: {
      label: this.rx.user.refreshMode$.pipe(
        startWith('manual'),
        switchMap((refreshMode) => {
          if (refreshMode === 'manual') {
            return of('Refresh');
          }

          return this.rx.lobby.autoRefresh$.pipe(
            startWith(0),
            switchMap(() => interval(1000)),
            map((s) => `Refreshing (${9 - s})`)
          );
        })
      ),
      connect: this.rx.lobby.refreshTrigger$,
      disabled: this.rx.lobby.refresh$.pipe(
        switchMap(() => {
          return of(false).pipe(delay(REFRESH_THROTTLE_TIME), startWith(true));
        }),
        startWith(false)
      ),
    },
  });

  lobbies = component({
    component: BergTableComponent,
    inputs: {
      data: this.rx.lobby.regionLobbies$,
      columns: [
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'type', label: 'Type' },
        { key: 'players', label: 'Players' },
      ],
      placeholder: 'No lobbies yet.',
      pluckLabel: (row: any, column: any) => {
        if (column === 'players') {
          return `${row.queries.length}/${row.maxPlayers}`;
        }

        if (column === 'difficulty') {
          return DIFFICULTY_LOCALE[row.difficulty as Difficulty];
        }

        if (column === 'type') {
          return `${TYPE_LOCALE[row.type as Type]}${
            row.type === QUEST
              ? ` - ${ACT_LOCALE[row.act as Act]} ${
                  QUEST_LOCALE[row.quest as Quest]
                }`
              : ''
          }${
            row.type === RUN ? ` - ${AREA_LOCALE[row.runArea as Area]} ` : ''
          }`;
        }

        if (column === 'act' && row) {
          return ACT_LOCALE[row.act as Act];
        }

        return '';
      },
      getProjectedComponent: this.authService.firebaseUser$.pipe(
        map((firebaseUser) => {
          return (lobby: Lobby) => {
            return lobby.queries.some(
              (query) => query.playerId === firebaseUser?.uid
            )
              ? component({
                  component: BergButtonComponent,
                  inputs: {
                    label: 'Leave',
                    type: 'cancel',
                    connect: this.rx.query.stopTrigger$,
                  },
                })
              : component({
                  component: BergButtonComponent,
                  inputs: {
                    label: 'Join',
                    connect: this.rx.lobby.joinTrigger$,
                    disabled: this.rx.user.hasErrors$,
                  },
                });
          };
        })
      ),
    },
  });

  constructor(private rx: Rx, private authService: AuthService) {}
}
