import { Injectable } from '@angular/core';
import { BergInputComponent, BergSelectComponent } from '@berglund/material';
import { component } from '@berglund/mixins';
import {
  ALL_PLATFORMS,
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
  Platform,
  PLATFORM_ID_LOCALE,
  PLATFORM_LOCALE,
  RefreshMode,
  REFRESH_MODE_LOCALE,
  Region,
  REGION_LOCALE,
} from '@d2qs/model';
import { Rx } from '@d2qs/rx';
import { map } from 'rxjs/operators';

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
      pluckLabel: (value: Region) => REGION_LOCALE[value],
    },
  });

  platform = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Platform',
      connect: this.rx.user.platform$,
      data: ALL_PLATFORMS,
      pluckLabel: (value: Platform) => PLATFORM_LOCALE[value],
    },
  });

  platformId$ = this.rx.user.platform$.pipe(
    map((platform) => {
      if (platform === 'pc') {
        return null;
      }

      return component({
        component: BergInputComponent,
        inputs: {
          label: PLATFORM_ID_LOCALE[platform],
          connect:
            platform === 'switch'
              ? this.rx.user.switchFriendCode$
              : platform === 'ps'
              ? this.rx.user.playStationId$
              : this.rx.user.xboxGamertag$,
        },
      });
    })
  );

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
