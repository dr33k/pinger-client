import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { AppResponse } from "../interface/app_response";
import { Server } from "../interface/server";
import { AppState } from "../interface/app_state";

@Pipe({name: 'list'})
export class List implements PipeTransform{
    transform(observable$: Observable<AppState<AppResponse>>): Server[]{
        var values:Server[] = []; 
        observable$.subscribe((appState: AppState<AppResponse>)=>{values = appState.appData?.data.servers || []});
        return values;
    }
}