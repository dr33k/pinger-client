import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
      console.log(response);

      const source: Observable<AppResponse> = of(response);

      const subscriber = {
        next(response: AppResponse) {
          return {
            ...response,
            data: { servers: response.data.servers?.filter(s => s.status === status) },
            message: this.responseMessage(response.data.servers?.length || 0, status.toString())
          }
        },
        error(response: AppResponse) { },
        complete() { },
        responseMessage(length: number, status: string): string {
          const userxp = status.replaceAll('_', ' ');
          return length <= 0 ?
            `There are no servers with ${userxp}` :
            `Servers filtered by ${userxp}`;
        }

      }
      source.subscribe(subscriber);

      return source
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        );
    }

  handleError(err: HttpErrorResponse): Observable<never> {
    console.log(err);
    return throwError(`Error occurred \nCode: ${err.status}\nMessage: ${err.message}`)
  }
}
