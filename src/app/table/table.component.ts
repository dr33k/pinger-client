import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, last, startWith, catchError } from 'rxjs/operators';
import { AppState } from '../interface/app_state';
import { AppResponse } from '../interface/app_response';
import { DataState } from '../enums/data.state.enum';
import { ServerService } from '../service/server.service';
import { Server } from '../interface/server';
import { Status } from '../enums/status.enum';
import { NgForm } from '@angular/forms';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  public readonly apiUrl: string = "";
  public notifier?: NotificationService;

  Status = Status;
  DataState = DataState;

  appState$: Observable<AppState<AppResponse>> = of({ dataState: DataState.LOADING_STATE });
  pingAddress = new BehaviorSubject<string>('');
  responseSubject = new BehaviorSubject<AppResponse | null>(null);
  isLoading = new BehaviorSubject<boolean>(false);
  currentFilterStatus: Status;

  servers: Server[] = [];

  constructor(private serverService: ServerService, notifier: NotificationService) {
    this.apiUrl = serverService.apiUrl;
    this.currentFilterStatus = Status.ALL;
    this.notifier = notifier;
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
        tap(pingResponse=> this.notifier?.default(pingResponse.message)),
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
        catchError((error: string) => { 
          this.notifier?.warning("Oops, something went wrong");
          return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

  filter(status: Status): void {
    this.currentFilterStatus = status;
    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.filter$(status, <AppResponse> this.responseSubject.value)
      .pipe(
        tap(filterResponse => {
          this.servers = filterResponse.data.servers || [];
          this.notifier?.default(filterResponse.message);
        }),
        map(filterResponse => { return { dataState: DataState.LOADED_STATE, appData: filterResponse } }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.responseSubject.value}),
        catchError((error: string) => { 
          this.notifier?.warning("Oops, something went wrong");
          return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

  save(serverForm: NgForm): void{
    this.isLoading.next(true);

    this.appState$ = <Observable<AppState<AppResponse>>> this.serverService.save$(serverForm.value as Server)
    .pipe(
      tap(saveResponse=>this.notifier?.success(saveResponse.message as string)),
      map((saveResponse)=>{
        this.servers.push(saveResponse.data.server as Server);
        saveResponse.data.servers = this.servers;
        this.isLoading.next(false);

        return {dataState: DataState.LOADED_STATE, appData: saveResponse}
      }),
      startWith({dataState: DataState.LOADING_STATE, appData: this.responseSubject.value}),
      tap(
        appState=>{
          this.responseSubject.next(appState.appData);
          document.getElementById("dismissAddServerModal")?.click();
          serverForm.resetForm({status: Status.SERVER_DOWN});
        }),
      catchError((error: string) => { 
        this.isLoading.next(false);
        this.notifier?.warning("Oops, something went wrong");
        return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

  delete(server: Server): void{
    this.appState$ = <Observable<AppState<AppResponse>>> this.serverService.delete$(server.id)
    .pipe(
      tap(deleteResponse=>this.notifier?.default(deleteResponse.message as string)),
      map((deleteResponse)=>{
        this.servers = this.servers.filter(s=> s.id !== server.id);
        deleteResponse.data.servers = this.servers;
        return {dataState: DataState.LOADED_STATE, appData: deleteResponse}
      }),
      startWith({dataState: DataState.LOADED_STATE, appData: this.responseSubject.value}),
      tap(appState=>{
        this.responseSubject.next(appState.appData);
    }),
      catchError((error: string) => { 
        this.notifier?.warning("Oops, something went wrong");
        return of({ dataState: DataState.ERROR_STATE, error }) })
      );
  }

  print():void{
    var datatype = "application/pdf";
    var table = document.getElementById("servers");
    var tableHtml = table?.outerHTML.replace(/ /g, "%20");
    var link = document.createElement("a");
    link.download = "servers.pdf";
    link.href = `data:${datatype}, ${tableHtml}`;

    this.notifier?.default("Downloading");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
