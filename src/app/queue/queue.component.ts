import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { Operators } from '@d2qs/components';
import { TitleAnnouncerService } from '@d2qs/core';
import { Rx } from '@d2qs/rx';
import { fromEvent, merge, Subject } from 'rxjs';
import { map, skip } from 'rxjs/operators';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-queue flex d-column',
    '[class.app-queue-alert-new-game]': 'alertNewGame',
  },
})
export class QueueComponent {
  private click$ = fromEvent(this.elementRef.nativeElement, 'click');

  private selectedIndexSub = new Subject<number>();

  private newGame$ = this.rx.game.game$.pipe(
    skip(1),
    map((game) => !!game)
  );

  alertNewGame = false;

  private alertNewGame$ = merge(
    this.newGame$,
    this.click$.pipe(map(() => false))
  );

  selectedIndex$ = merge(
    this.newGame$.pipe(map((newGame) => (newGame ? 1 : 0))),
    this.selectedIndexSub
  );

  constructor(
    public operators: Operators,
    public rx: Rx,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    private titleAnnouncer: TitleAnnouncerService
  ) {
    this.alertNewGame$.subscribe((alertNewGame) => {
      this.alertNewGame = alertNewGame;
      this.changeDetectorRef.markForCheck();

      if (alertNewGame) {
        this.titleAnnouncer.start('D2QS - Lobby started!');
      } else {
        this.titleAnnouncer.stop();
      }
    });
  }

  _onSelectedIndexChange(index: number): void {
    this.selectedIndexSub.next(index);
  }
}
