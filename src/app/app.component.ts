import { Component, Type } from '@angular/core';
import { ServerService } from './service/server.service';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from './interface/app_state';
import { AppResponse } from './interface/app_response';
import { DataState } from './enums/data.state.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  appState$: Observable<AppState<AppResponse>> = of({dataState: DataState.LOADING_STATE});
  public readonly apiUrl: string = "" ;
  
  constructor(private serverService: ServerService){
    this.apiUrl = serverService.apiUrl;
  }

  ngOnInit():void{
    this.appState$ = <Observable<AppState<AppResponse>>> this.serverService.servers$
    .pipe(
      map(response =>{  return {dataState: DataState.LOADED_STATE, appData: response}}),
      startWith({dataState: DataState.LOADING_STATE}),
      catchError((error: string) => { return of({dataState: DataState.ERROR_STATE, error})})
    )
  }
}
