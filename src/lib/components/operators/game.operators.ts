import { Injectable } from '@angular/core';
import {
  BergButtonComponent,
  BergInputComponent,
  BergTableComponent,
} from '@berglund/material';
import { component } from '@berglund/mixins';
import { Area, AREA_LOCALE } from '@d2queue/api';
import { Rx } from '@d2queue/rx';
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

  act = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.act$,
      label: 'Starting act',
    },
  });

  quest = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.quest$,
      label: 'Starting quest',
    },
  });

  runArea = component({
    component: BergInputComponent,
    inputs: {
      readonly: true,
      connect: this.rx.game.runArea$,
      label: 'Area',
    },
  });

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

  all$ = this.rx.game.type$.pipe(
    map((type) => {
      const components = [
        this.hostNick,
        this.gameName,
        this.password,
        this.type,
        this.difficulty,
      ];

      if (type === 'quest') {
        components.push(this.act, this.quest);
      }

      if (type === 'run') {
        components.push(this.runArea);
      }

      return components;
    })
  );

  constructor(private rx: Rx) {}
}
