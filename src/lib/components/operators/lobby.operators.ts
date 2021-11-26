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
  lobbyComparator,
  Quest,
  QUEST,
  QUEST_LOCALE,
  REFRESH_THROTTLE_TIME,
  RUN,
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
      data: this.rx.lobby.regionLobbies$,
      comparators: this.authService.firebaseUser$.pipe(
        map((user) => {
          return {
            difficulty: (a: Lobby, b: Lobby) => {
              return lobbyComparator(
                a,
                b,
                this.lobbyToDifficultyLabel,
                user?.uid
              );
            },
            type: (a: Lobby, b: Lobby) => {
              return lobbyComparator(a, b, this.lobbyToTypeLabel, user?.uid);
            },
            players: (a: Lobby, b: Lobby) => {
              return lobbyComparator(a, b, this.lobbyToPlayersLabel, user?.uid);
            },
          };
        })
      ),
      columns: [
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'type', label: 'Type' },
        { key: 'players', label: 'Players' },
      ],
      placeholder: 'No lobbies yet.',
      pluckLabel: (row: any, column: any) => {
        if (column === 'players') {
          return this.lobbyToPlayersLabel(row);
        }

        if (column === 'difficulty') {
          return this.lobbyToDifficultyLabel(row);
        }

        if (column === 'type') {
          return this.lobbyToTypeLabel(row);
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
                    connect: this.rx.query.cancelTrigger$,
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

  private lobbyToPlayersLabel(lobby: Lobby): string {
    return `${lobby.queries.length}/${lobby.maxPlayers}`;
  }

  private lobbyToDifficultyLabel(lobby: Lobby): string {
    return DIFFICULTY_LOCALE[lobby.difficulty as Difficulty];
  }

  private lobbyToTypeLabel(lobby: Lobby): string {
    return `${TYPE_LOCALE[lobby.type]}${
      lobby.type === QUEST
        ? ` - ${ACT_LOCALE[lobby.act as Act]} ${
            QUEST_LOCALE[lobby.quest as Quest]
          }`
        : ''
    }${lobby.type === RUN ? ` - ${AREA_LOCALE[lobby.runArea as Area]} ` : ''}`;
  }
}
