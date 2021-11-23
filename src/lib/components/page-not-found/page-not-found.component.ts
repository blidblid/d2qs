import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'app-page-not-found flex j-center a-center d-column h-100 w-100 c-pointer',
    '(click)': 'navigateToStart()',
  },
})
export class PageNotFoundComponent {
  constructor(private router: Router) {}

  navigateToStart(): void {
    this.router.navigateByUrl('');
  }
}
