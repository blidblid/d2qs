import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TitleAnnouncerService {
  private initialTitle: string;
  private subscription = Subscription.EMPTY;

  constructor(private titleService: Title) {
    this.initialTitle = this.titleService.getTitle();
  }

  start(title: string, period = 1000): void {
    this.subscription.unsubscribe();
    this.initialTitle = this.titleService.getTitle();

    this.subscription = interval(period)
      .pipe(startWith(0))
      .subscribe((counter) => {
        this.titleService.setTitle(counter % 2 ? this.initialTitle : title);
      });
  }

  stop(): void {
    this.titleService.setTitle(this.initialTitle);
    this.subscription.unsubscribe();
  }
}
