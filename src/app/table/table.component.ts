import { ChangeDetectionStrategy, Component} from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, startWith, catchError } from 'rxjs/operators';
import { AppState } from '../interface/app_state';
import { AppResponse } from '../interface/app_response';
import { DataState } from '../enums/data.state.enum';
import { ServerService } from '../service/server.service';
import { Server } from '../interface/server';
import { Status } from '../enums/status.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  public addServerForm: FormGroup;

  Status = Status;
  DataState = DataState;

  appState$: Observable<AppState<AppResponse>> = of({ dataState: DataState.LOADING_STATE });
  pingAddress = new BehaviorSubject<string>('');
  responseSubject = new BehaviorSubject<AppResponse | null>(null);
  isLoading = new BehaviorSubject<boolean>(false);
  currentFilterStatus = new BehaviorSubject<Status>(Status.ALL);
  queryOrForm = new BehaviorSubject<'QUERY'|'FORM'>('QUERY');

  readonly servers: Array<Server> = new Array();

  constructor(private serverService: ServerService, notifier: NotificationService,
    fb: FormBuilder) {
    this.apiUrl = serverService.apiUrl;
    this.notifier = notifier;

    this.addServerForm = fb.group({
      ipAddress: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      name: ['', [Validators.required, Validators.min(3)]],
      memory: ['', [Validators.required, Validators.min(3)]],
      type: ['', [Validators.required, Validators.min(3)]],
      status: [Status.SERVER_DOWN]
    });
  }

  identify(index: number, server: Server) {
    return server.id;
  }
  ngOnInit(): void {
    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.servers$
      .pipe(
        tap(response => {
          this.responseSubject.next(response);
          this.servers.splice(0,this.servers.length, ...response.data.servers || []);
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
        tap(pingResponse => {
          this.notifier?.default(pingResponse.message);
        }),
        map(pingResponse => {
          if (filteredServer) {
            (<Server>filteredServer).status = pingResponse.data.server?.status as Status;

            pingResponse.data.servers = this.servers;     

            return {
              dataState: DataState.LOADED_STATE,
              appData: pingResponse
            }
          }
          else {
            this.addServerForm.get('ipAddress')?.setValue(ipAddress);
            if(pingResponse.data.server?.status == Status.SERVER_UP) document.getElementById("addServerQueryButton")?.click();
            return {
              dataState: DataState.LOADED_STATE,
              servers: this.servers
            }
          }
        }),
        tap(()=>this.pingAddress.next('')),
        startWith({ dataState: DataState.LOADED_STATE, servers: this.servers }),
        catchError((error: string) => {
          this.notifier?.warning("Oops, something went wrong");
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }

  filter(s: string): void {
    var status: Status = Status.ALL;
    switch(s){
      case "ALL": status = Status.ALL;break;
      case "SERVER_UP": status = Status.SERVER_UP;break;
      case "SERVER_DOWN": status = Status.SERVER_DOWN;break;
    }  

    this.currentFilterStatus.next(status);
    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.filter$(status, <AppResponse>this.responseSubject.value)
      .pipe(
        tap(filterResponse => {
          this.servers.splice(0 ,this.servers.length, ...filterResponse.data.servers || []);
          this.notifier?.default(filterResponse.message);
        }),
        map(filterResponse => { return { dataState: DataState.LOADED_STATE, appData: filterResponse } }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.responseSubject.value }),
        catchError((error: string) => {
          this.notifier?.warning("Oops, something went wrong");
          console.log(error);          
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }

  save(): void {
    this.isLoading.next(true);

    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.save$(this.addServerForm.value as Server)
      .pipe(
        tap(saveResponse => this.notifier?.success(saveResponse.message as string)),
        map((saveResponse) => {
          this.responseSubject.value?.data.servers?.push(saveResponse.data.server as Server);
          this.isLoading.next(false);

          return { dataState: DataState.LOADED_STATE, appData: this.responseSubject.value }
        }),
        startWith({ dataState: DataState.LOADING_STATE, appData: this.responseSubject.value }),
        tap(
          appState => {
            this.responseSubject.next(appState.appData);
            document.getElementById("dismissAddServerModal")?.click();
            this.addServerForm.reset();
            this.currentFilterStatus.next(Status.ALL);
          }),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier?.warning("Oops, something went wrong");
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }

  delete(server: Server): void {
    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.delete$(server.id)
      .pipe(
        tap(deleteResponse => this.notifier?.default(deleteResponse.message as string)),
        map((deleteResponse) => {
          this.servers.splice(0, this.servers.length, ...this.servers.filter(s => s.id !== server.id));
          deleteResponse.data.servers = this.servers;
          this.responseSubject.next(deleteResponse);
          return { dataState: DataState.LOADED_STATE, servers: this.servers }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.responseSubject.value }),
        catchError((error: string) => {
          this.notifier?.warning("Oops, something went wrong");
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }

  print(): void {
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

  addServerQueryOrForm(value: 'QUERY'|'FORM'){
    this.queryOrForm.next(value);
  }
}
