import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subject, Subscriber } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import LoginRequest from './login-request';
import LoginResponse from './login-response';
import { NotificationService } from '../notifications/notification.service';
import { ERROR_COMPONENT_TYPE } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private authApiUrl = 'http://127.0.0.1:3021/auth/login';

  private authenticated: BehaviorSubject<boolean>;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient, private notificationService: NotificationService) {
    this.authenticated = new BehaviorSubject<boolean>(false);

    this.notificationService.add(
      false,
      'info',
      'Connectez-vous afin de jouer une partie!'
    );
  }

  getAuthenticated(): Observable<boolean> {
    console.log(this.authenticated.value);
    return this.authenticated.asObservable();
  }

  private setAuthenticated(value: boolean): void {
    this.authenticated.next(value);
  }

  login(request: LoginRequest): Observable<boolean> {
    this.httpClient
      .post<LoginResponse>(this.authApiUrl, request, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processed login request.`)),
        // map(_ => _.authenticated),
        catchError(this.handleError('login', { } as LoginResponse))
      )
      .subscribe((value: LoginResponse) => this.processLogin(value));

    return this.getAuthenticated();
  }

  logout(): void {
    this.notificationService.clear();
    this.notificationService.add(
      false,
      'info',
      'Connectez-vous afin de jouer une partie!'
    );
    this.setAuthenticated(false);
  }

  private processLogin(reponse: LoginResponse): void {
    if (reponse.authenticated) {
      localStorage.setItem(
        'session',
        JSON.stringify(reponse)
      );

      this.notificationService.clear();
      this.notificationService.add(
        true,
        'success',
        'Vous êtes connecté! Allez mesurer votre savoir avec quelques quiz.'
      );
    }
    else {
      this.notificationService.add(
        true,
        'danger',
        'Une erreur est survenue lors de l\'authentification. Veuillez vous assurer de l\'exactitude des identifiants saisis.'
      );
    }

    this.setAuthenticated(reponse.authenticated);
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
