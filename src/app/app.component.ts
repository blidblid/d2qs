import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  BreakpointService,
  HUGE_BREAKPOINT,
  MOBILE_BREAKPOINT,
  SMALL_BREAKPOINT,
} from '@d2qs/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'breakpointClass',
    '[class.app-component]': 'true',
  },
})
export class AppComponent {
  breakpointClass: string;

  constructor(private breakpointService: BreakpointService) {
    this.subscribe();
  }

  private subscribe(): void {
    const breakpointClass$ = this.breakpointService.getMatches().pipe(
      map((breakpoint) => {
        if (breakpoint.breakpoints[MOBILE_BREAKPOINT]) {
          return 'app-mobile app-small';
        } else if (breakpoint.breakpoints[SMALL_BREAKPOINT]) {
          return 'app-small';
        } else if (!breakpoint.breakpoints[HUGE_BREAKPOINT]) {
          return 'app-large app-huge';
        } else {
          return 'app-large';
        }
      })
    );

    breakpointClass$.subscribe(
      (breakpointClass) => (this.breakpointClass = breakpointClass)
    );
  }
}
