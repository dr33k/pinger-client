import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { Clean } from './pipes/clean.pipe';
import { TableComponent } from './table/table.component';
import { SearchComponent } from './search/search.component';
import { FormsModule } from '@angular/forms';
import { NotificationModule } from './notification/notification.module';
import { ServerService } from './service/server.service';

@NgModule({
  declarations: [
    AppComponent,
    Clean,
    TableComponent,
    SearchComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NotificationModule,
    ReactiveFormsModule
  ],
  providers: [ServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
