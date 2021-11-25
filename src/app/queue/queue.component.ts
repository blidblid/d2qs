import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { AuthService, UserService } from '@d2qs/api';
import { Operators } from '@d2qs/components';
import { Rx } from '@d2qs/rx';
import { merge, Subject } from 'rxjs';
import { map, skip } from 'rxjs/operators';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-queue flex d-column',
  },
})
export class QueueComponent {
  private selectedIndexSub = new Subject<number>();

  selectedIndex$ = merge(
    this.rx.game.game$.pipe(
      skip(1),
      map((game) => (game ? 1 : 0))
    ),
    this.selectedIndexSub
  );

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public operators: Operators,
    public rx: Rx
  ) {}

  _onSelectedIndexChange(index: number): void {
    this.selectedIndexSub.next(index);
  }
}
