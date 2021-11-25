import { Injectable } from '@angular/core';
import { BergInputComponent, BergSelectComponent } from '@berglund/material';
import { component } from '@berglund/mixins';
import {
  ALL_REGIONS,
  Area,
  AREA_LOCALE,
  AUTO,
  FARM_AREAS,
  MANUAL,
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
      type: 'text',
    },
  });

  region = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Region',
      connect: this.rx.user.region$,
      data: ALL_REGIONS,
      pluckLabel: (value: Region) => REGION_LOCALE[value],
    },
  });

  refreshMode = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Refresh mode',
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
      connect: this.rx.user.areas$,
      data: FARM_AREAS,
      pluckLabel: (value: Area) => AREA_LOCALE[value],
    },
  });

  constructor(private rx: Rx) {}
}
