import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, startWith, catchError } from 'rxjs/operators';
import { AppState } from '../interface/app_state';
import { AppResponse } from '../interface/app_response';
import { DataState } from '../enums/data.state.enum';
import { ServerService } from '../service/server.service';
import { Server } from '../interface/server';
import { Status } from '../enums/status.enum';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  public readonly apiUrl: string = "";

  appState$: Observable<AppState<AppResponse>> = of({ dataState: DataState.LOADING_STATE });
  pingAddress = new BehaviorSubject<string>('');
  responseSubject = new BehaviorSubject<AppResponse | null>(null);
  currentFilterStatus: Status;

  servers: Server[] = [];

  constructor(private serverService: ServerService) {
    this.apiUrl = serverService.apiUrl;
    this.currentFilterStatus = Status.ALL;
  }

  identify(index: number, server: Server) {
    return server.id;
  }

  ngOnInit(): void {
    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.servers$
      .pipe(
        tap(response => {
          this.responseSubject.next(response);
          this.servers = response.data.servers || [];
        }),
        map(response => { return { dataState: DataState.LOADED_STATE, appData: response } }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => { return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

  ping(ipAddress: string): void {
    this.pingAddress.next(ipAddress);
    var filteredServer = this.servers.find((s) => s.ipAddress == ipAddress);

    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.ping$(ipAddress)
      .pipe(
        map(pingResponse => {
          (<Server>filteredServer).status = <Status>pingResponse.data.server?.status;

          pingResponse.data.servers = this.servers;
          this.pingAddress.next('');

          return {
            dataState: DataState.LOADED_STATE,
            appData: pingResponse
          }
        }),
        startWith({ dataState: DataState.LOADED_STATE, servers: this.servers }),
        catchError((error: string) => { return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

  filter(status: Status): void {
    this.currentFilterStatus = status;
    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.filter$(status, <AppResponse> this.responseSubject.value)
      .pipe(
        tap(filterResponse => {this.servers = filterResponse.data.servers || []}),
        map(filterResponse => { return { dataState: DataState.LOADED_STATE, appData: filterResponse } }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.responseSubject.value}),
        catchError((error: string) => { return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

}
