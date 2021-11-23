import { Directive } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export class CanLeak {
  protected destroySub = new Subject<void>();

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
