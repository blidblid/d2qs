import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  HUGE_BREAKPOINT,
  LARGE_BREAKPOINT,
  MOBILE_BREAKPOINT,
  SMALL_BREAKPOINT,
} from './breakpoint-model';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  matches$ = this.breakpointObserver
    .observe([
      MOBILE_BREAKPOINT,
      SMALL_BREAKPOINT,
      LARGE_BREAKPOINT,
      HUGE_BREAKPOINT,
    ])
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  mobileMatches$ = this.matches$.pipe(
    map((matches) => matches.breakpoints[MOBILE_BREAKPOINT])
  );

  constructor(private breakpointObserver: BreakpointObserver) {}

  mobileMatches(): boolean {
    return this.breakpointObserver.isMatched(MOBILE_BREAKPOINT);
  }

  smallMatches(): boolean {
    return this.breakpointObserver.isMatched(SMALL_BREAKPOINT);
  }

  largeMatches(): boolean {
    return this.breakpointObserver.isMatched(LARGE_BREAKPOINT);
  }

  getMatches(): Observable<BreakpointState> {
    return this.matches$;
  }
}
