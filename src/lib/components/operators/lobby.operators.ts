import { Injectable } from '@angular/core';
import { BergButtonComponent, BergTableComponent } from '@berglund/material';
import { component } from '@berglund/mixins';
import { AuthApi } from '@d2qs/api';
import {
  Act,
  ACT_LOCALE,
  Area,
  AREA_LOCALE,
  DIFFICULTY_LOCALE,
  Lobby,
  lobbyComparator,
  Quest,
  QUEST_LOCALE,
  REFRESH_THROTTLE_TIME,
  TYPE_LOCALE,
} from '@d2qs/model';
import { Rx } from '@d2qs/rx';
import { combineLatest, interval, of } from 'rxjs';
import { delay, map, startWith, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LobbyOperators {
  refreshTrigger = component({
    component: BergButtonComponent,
    inputs: {
      label: this.rx.user.refreshMode$.pipe(
        startWith('auto'),
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
      data: this.rx.lobby.filteredLobbies$,
      comparators: this.authApi.firebaseUserId$.pipe(
        map((userId) => {
          return {
            type: (a: Lobby, b: Lobby) => {
              return lobbyComparator(a, b, this.lobbyToTypeLabel, userId);
            },
            players: (a: Lobby, b: Lobby) => {
              return lobbyComparator(a, b, this.lobbyToPlayersLabel, userId);
            },
          };
        })
      ),
      columns: [
        { key: 'type', label: 'Type' },
        { key: 'players', label: 'Players' },
      ],
      placeholder: combineLatest([
        this.rx.query.difficulty$,
        this.rx.query.type$,
      ]).pipe(
        map(([difficulty, type]) => {
          return `No ${DIFFICULTY_LOCALE[difficulty]}/${TYPE_LOCALE[type]} lobbies found.`;
        })
      ),
      pluckLabel: (row: any, column: any) => {
        if (column === 'players') {
          return this.lobbyToPlayersLabel(row);
        }

        if (column === 'type') {
          return this.lobbyToTypeLabel(row);
        }

        return '';
      },
      getProjectedComponent: this.authApi.firebaseUserId$.pipe(
        map((userId) => {
          return (lobby: Lobby) => {
            return lobby.queries.some((query) => query.playerId === userId)
              ? component({
                  component: BergButtonComponent,
                  inputs: {
                    label: 'Leave',
                    type: 'cancel',
                    connect: this.rx.query.leaveTrigger$,
                  },
                })
              : component({
                  component: BergButtonComponent,
                  inputs: {
                    label: 'Join',
                    hint: this.rx.user.errorHint$,
                    connect: this.rx.lobby.joinTrigger$,
                    disabled: this.rx.user.hasErrors$,
                  },
                });
          };
        })
      ),
    },
  });

  constructor(private rx: Rx, private authApi: AuthApi) {}

  private lobbyToPlayersLabel(lobby: Lobby): string {
    return `${lobby.queries.length}/${lobby.maxPlayers}`;
  }

  private lobbyToTypeLabel(lobby: Lobby): string {
    if (lobby.type === 'duel') {
      return `Level ${lobby.maxLevel} duels`;
    }

    if (lobby.type === 'quest') {
      return `${ACT_LOCALE[lobby.act as Act]} ${
        QUEST_LOCALE[lobby.quest as Quest]
      }`;
    }

    if (lobby.type === 'run') {
      return `${AREA_LOCALE[lobby.runArea as Area]} run`;
    }

    return TYPE_LOCALE[lobby.type];
  }
}
