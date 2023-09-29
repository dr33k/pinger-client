import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AppResponse } from '../interface/app_response';
import { Server } from '../interface/server';
import { Status } from '../enums/status.enum';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public readonly apiUrl: string = "http://localhost:8080/";

  constructor(private http: HttpClient) { }

  servers$: Observable<AppResponse>
    = this.http.get<AppResponse>(`${this.apiUrl}servers/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  save$: (value: Server) => Observable<AppResponse>
    = (server: Server) => {
      return <Observable<AppResponse>>
        this.http.post<AppResponse>(`${this.apiUrl}servers/save`, server)
          .pipe(
            tap(console.log),
            catchError(this.handleError)
          )
    };

  ping$: (value: string) => Observable<AppResponse>
    = (ipAddress: string) => {
      return <Observable<AppResponse>>
        this.http.get(`${this.apiUrl}servers/ping/${ipAddress}`)
          .pipe(
            tap(console.log),
            catchError(this.handleError)
          )
    };

  delete$: (id: number) => Observable<AppResponse>
    = (id: number) => {
      return this.http.delete<AppResponse>(`${this.apiUrl}servers/delete/${id}`)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        )
    };

  filter$: (status: Status, response: AppResponse) => Observable<AppResponse>
    = (status: Status, response: AppResponse) => {
      const source: Observable<AppResponse> = new Observable(
          subscriber=>{
          const filterResponse = {
            ...response,
            data: {servers: this.filter(status, response.data?.servers || [])},
            message: this.responseMessage(response.data.servers?.length || 0, status.toString())
          }

          subscriber.next(filterResponse);
          subscriber.complete();
        }
      );

      source.subscribe();

      return source
        .pipe(
          tap(()=>console.log(response)),
          catchError(this.handleError)
        );
    }

  handleError(err: HttpErrorResponse): Observable<never> {
    console.log(err);
    return throwError(`Error occurred \nCode: ${err.status}\nMessage: ${err.message}`)
  }

  responseMessage(length: number, status: string): string {
    const userxp = status.replaceAll('_', ' ');
    return length <= 0 ?
      `There are no servers with ${userxp}` :
      `Servers filtered by ${userxp}`;
  }
  
  filter(status: Status, servers: Server[]): Server[]{
    if (status == Status.ALL) return servers;
    else return servers.filter(s => s.status === status);
  }
}
