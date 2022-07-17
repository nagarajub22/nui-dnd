import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NuiDndLibModule } from 'projects/nui-dnd-lib/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NuiDndLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
