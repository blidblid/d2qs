import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { LogoModule } from '@d2queue/components';
import { MaterialSharedModule } from '@d2queue/core';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  exports: [HomeComponent],
  imports: [
    BrowserModule,
    LogoModule,
    MaterialSharedModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class HomeModule {}
