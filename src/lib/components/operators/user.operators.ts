import { Injectable } from '@angular/core';
import { BergInputComponent, BergSelectComponent } from '@berglund/material';
import { component } from '@berglund/mixins';
import {
  ALL_REGIONS,
  ALWAYS,
  Area,
  AREA_LOCALE,
  AUTO,
  FARM_AREAS,
  HintsMode,
  HINTS_MODE_LOCALE,
  MANUAL,
  NEVER,
  RefreshMode,
  REFRESH_MODE_LOCALE,
  Region,
  REGION_LOCALE,
} from '@d2qs/model';
import { Rx } from '@d2qs/rx';

@Injectable({ providedIn: 'root' })
export class UserOperators {
  nick = component({
    component: BergInputComponent,
    inputs: {
      label: 'Nick',
      connect: this.rx.user.nick$,
      hint: this.rx.user.getHint('Your d2qs nick.'),
      type: 'text',
    },
  });

  region = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Region',
      connect: this.rx.user.region$,
      data: ALL_REGIONS,
      pluckLabel: (value: Region) => (value ? REGION_LOCALE[value] : ''),
    },
  });

  refreshMode = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Refresh',
      connect: this.rx.user.refreshMode$,
      data: [AUTO, MANUAL],
      pluckLabel: (value: RefreshMode) => REFRESH_MODE_LOCALE[value],
    },
  });

  areas = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Farm areas',
      selection: 'multiple',
      hint: this.rx.user.getHint('In farm lobbies, this is your area pool.'),
      connect: this.rx.user.areas$,
      data: FARM_AREAS,
      pluckLabel: (value: Area) => AREA_LOCALE[value],
    },
  });

  hintsMode = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Hints',
      connect: this.rx.user.hintsMode$,
      data: [ALWAYS, NEVER],
      pluckLabel: (value: HintsMode) => HINTS_MODE_LOCALE[value],
    },
  });

  constructor(private rx: Rx) {}
}
