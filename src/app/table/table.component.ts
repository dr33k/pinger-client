import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from '../interface/app_state';
import { AppResponse } from '../interface/app_response';
import { DataState } from '../enums/data.state.enum';
import { ServerService } from '../service/server.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  public readonly apiUrl: string = "" ;

  appState$: Observable<AppState<AppResponse>> = of({dataState: DataState.LOADING_STATE});
  pingSubject = new BehaviorSubject('');
  address$: Observable<string> = this.pingSubject.asObservable();

  constructor(private serverService: ServerService){
    this.apiUrl = serverService.apiUrl;
  }

  ngOnInit():void{
    this.appState$ = <Observable<AppState<AppResponse>>> this.serverService.servers$
    .pipe(
      map(response =>{  return {dataState: DataState.LOADED_STATE, appData: response}}),
      startWith({dataState: DataState.LOADING_STATE}),
      catchError((error: string) => { return of({dataState: DataState.ERROR_STATE, error})})
    );
  }

  ping(ipAddress: string):void{
    this.pingSubject.next(ipAddress);

    this.appState$ = <Observable<AppState<AppResponse>>>this.serverService.ping$(ipAddress)
    .pipe(
      map(response => { return {dataState: DataState.LOADED_STATE, appData: response}}),
      startWith({dataState: DataState.LOADING_STATE}),
      catchError( (error: string) =>{return of({dataState: DataState.ERROR_STATE, error})})
    );
  }


}
