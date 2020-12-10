import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import LoginRequest from './login-request';
import LoginResponse from './login-response';
import { NotificationService } from '../notifications/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // private authApiUrl = 'http://pedago.univ-avignon.fr:3021/api/auth/login';
  private authApiUrl = 'http://127.0.0.1:3021/api/auth/login';
  private authenticated: BehaviorSubject<boolean>;

  // Options pour les HTTP Headers utilisées lors des requêtes HTTP.
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient, private notificationService: NotificationService) {
    const data: LoginResponse = JSON.parse(localStorage.getItem('session'));
    const isAuthenticated = data?.authenticated;

    this.authenticated = new BehaviorSubject<boolean>(isAuthenticated);

    // Lorsque l'application est lancée initialement, l'utilisateur n'est pas
    // connecté. On affiche alors un message l'invitant à se connecter.
    if (!isAuthenticated) {
      this.notificationService.add(
        false,
        'info',
        'Connectez-vous afin de jouer une partie!'
      );
    }
  }

  getAuthenticated(): Observable<boolean> {
    return this.authenticated.asObservable();
  }

  private setAuthenticated(value: boolean): void {
    this.authenticated.next(value);
  }

  /**
   * Connecter un utilisateur et ouverture de sa session.
   *
   * @param request: Identifiants de l'utilisateur.
   */
  login(request: LoginRequest): Observable<boolean> {
    this.httpClient
      .post<LoginResponse>(this.authApiUrl, request, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing login request for \'${request.username}\'.`)),
        catchError(this.handleError('login', { } as LoginResponse))
      )
      // Lorsqu'on reçoit une réponse, la traitée avec this.processLogin().
      .subscribe((value: LoginResponse) => this.processLogin(value));

    // L'observable de la valeur d'authentification est retournée afin que
    // l'on puisse recevoir ses nouvelles valeurs une fois que l'appel HTTP
    // est traité par this.processLogin().
    return this.getAuthenticated();
  }

  /**
   * Déconnecter l'utilisateur et fermer sa session.
   */
  logout(): void {
    // Fermer la session dans le localStorage.
    const data: LoginResponse = JSON.parse(localStorage.getItem('session'));
    data.authenticated = false;
    localStorage.setItem('session', JSON.stringify(data));

    // TODO: Flip the online flag in the PostgreSQL database.

    // Avertir l'utilisateur à l'aide de notifications appropriées.
    this.notificationService.clear();
    this.notificationService.add(
      false,
      'info',
      'Connectez-vous afin de jouer une partie!'
    );

    // Avertir les subscribers que l'utilisateur n'est plus connecté.
    this.setAuthenticated(false);
  }

  /**
   * Traitement interne d'une réponse à la requête HTTP du login.
   *
   * @param response Réponse à la requête HTTP du login.
   */
  private processLogin(reponse: LoginResponse): void {
    if (reponse.authenticated) {
      // Afficher un message de réussite!
      this.notificationService.clear();
      this.notificationService.add(
        true,
        'success',
        'Vous êtes connecté! Allez mesurer votre savoir avec quelques quiz.'
      );

      // Conserver la date de la dernière connexion réussie.
      const data = JSON.parse(localStorage.getItem('session'));
      if (data?.newLoginDate && data?.username === reponse.username) {
        // Si ce n'est pas la première connexion d'un utilisateur à partir de
        // cette machine et que c'est le même utilisateur qui se reconnecte...
        localStorage.setItem('lastLoginDate', data?.newLoginDate);
      }
      else {
        localStorage.removeItem('lastLoginDate');
      }

      // Sauvegarder l'information de l'utilisateur dans la session sur
      // localStorage.
      localStorage.setItem(
        'session',
        JSON.stringify(reponse)
      );
    }
    else {
      // Afficher un message d'échec...
      this.notificationService.add(
        true,
        'danger',
        'Une erreur est survenue lors de l\'authentification. Veuillez vous assurer de l\'exactitude des identifiants saisis.'
      );
    }

    // Avertir les subscribers que l'état de l'authentification est modifié.
    this.setAuthenticated(reponse.authenticated);
  }

  /**
   * Assurer une bonne gestion d'une erreur survenue lors d'une requête HTTP.
   *
   * Idée empruntée de la partie 6 du tutoriel d'Angular:
   * https://angular.io/tutorial/toh-pt6#handleerror
   *
   * @param operation - Nom de l'opération à l'origine de l'erreur.
   * @param result - Valeur optionelle retournée en tant qu'Observable<T>.
   */
  private handleError<T>(operation = 'operation', result?: T): any {
    return (error: any): Observable<T> => {
      // Stocker cette erreur dans notre infrastructure de logging.
      // TODO: Trouver une meilleur infrastructure de logging que la console du client...
      console.error(error); // log to console instead

      // L'observable permet à l'application de continuer d'exécuter tandis que
      // les subscribers receveront éventuellement la réponse du traitement de
      // cette erreur.
      return of(result as T);
    };
  }

}
