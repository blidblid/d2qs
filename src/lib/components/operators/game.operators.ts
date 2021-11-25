import { Injectable } from '@angular/core';
import {
  BergButtonComponent,
  BergInputComponent,
  BergTableComponent,
} from '@berglund/material';
import { component } from '@berglund/mixins';
import { Area, AREA_LOCALE } from '@d2qs/api';
import { Rx } from '@d2qs/rx';
import { map, pluck } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GameOperators {
  hostNick = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.hostNick$,
      label: 'Host',
    },
  });

  gameName = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.name$,
      label: 'Game name',
      getProjectedComponent: () => {
        return component({
          component: BergButtonComponent,
          inputs: {
            style: 'icon',
            label: 'content_copy',
            connect: this.rx.game.contentCopyTrigger$,
          },
        });
      },
    },
  });

  password = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: 1,
      label: 'Password',
    },
  });

  type = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.localizedType$,
      label: 'Type',
    },
  });

  difficulty = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.difficulty$,
      label: 'Difficulty',
    },
  });

  act$ = this.rx.game.type$.pipe(
    map((type) => {
      return type === 'quest'
        ? component({
            component: BergInputComponent,
            inputs: {
              readonly: true,
              connect: this.rx.game.act$,
              label: 'Starting act',
            },
          })
        : null;
    })
  );

  quest$ = this.rx.game.type$.pipe(
    map((type) => {
      return type === 'quest'
        ? component({
            component: BergInputComponent,
            inputs: {
              readonly: true,
              connect: this.rx.game.quest$,
              label: 'Starting quest',
            },
          })
        : null;
    })
  );

  runArea$ = this.rx.game.type$.pipe(
    map((type) => {
      return type === 'quest'
        ? component({
            component: BergInputComponent,
            inputs: {
              readonly: true,
              connect: this.rx.game.runArea$,
              label: 'Area',
            },
          })
        : null;
    })
  );

  players = component({
    component: BergTableComponent,
    inputs: {
      data: this.rx.game.truthyGame$.pipe(
        pluck('players'),
        map((playerRecord) => Object.values(playerRecord))
      ),
      columns: this.rx.game.truthyGame$.pipe(
        map((game) => {
          const columns = [{ key: 'nick', label: 'Player' }];

          if (game.lobby.type === 'farm') {
            columns.push({ key: 'areas', label: 'Areas' });
          }

          return columns;
        })
      ),
      placeholder: 'No players loaded.',
      pluckLabel: (row: any, column: any) => {
        if (column === 'nick') {
          return row.nick;
        }

        if (column === 'areas') {
          return row.areas.map((area: Area) => AREA_LOCALE[area]).join(', ');
        }

        return '';
      },
    },
  });

  constructor(private rx: Rx) {}
}
