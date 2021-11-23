import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergOutletModule } from '@berglund/mixins';
import { MaterialSharedModule } from '@d2queue/core';
import { QueueComponent } from './queue.component';

@NgModule({
  declarations: [QueueComponent],
  imports: [CommonModule, BergOutletModule, MaterialSharedModule],
  exports: [QueueComponent],
})
export class QueueModule {}
