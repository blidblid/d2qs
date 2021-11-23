import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialSharedModule } from '@d2queue/core';
import { LogoComponent } from './logo.component';

@NgModule({
  declarations: [LogoComponent],
  imports: [CommonModule, MaterialSharedModule],
  exports: [LogoComponent],
})
export class LogoModule {}
