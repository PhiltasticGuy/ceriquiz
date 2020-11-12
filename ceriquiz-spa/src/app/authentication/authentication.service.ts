import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import LoginRequest from './login-request';
import LoginResponse from './login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private authApiUrl = 'http://localhost:3021/auth/login';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) {

  }

  login(request: LoginRequest): Observable<LoginResponse> {
    console.log(JSON.stringify(request));
    return this.httpClient.post(this.authApiUrl, request, this.httpOptions).pipe(
      // tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('login'))
    );
    // return {
    //   authenticated: false,
    //   username: request.username,
    //   firstname: 'Philippe',
    //   lastname: 'Turcotte'
    // };
  }

  logout(): void {
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T): any {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
