import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import Profile from './profile';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private profileApiUrl = 'http://pedago.univ-avignon.fr:3021/profile';
  private profileApiUrl = 'http://127.0.0.1:3021/profile';

  // Options pour les HTTP Headers utilisées lors des requêtes HTTP.
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  public getProfile(username: string): Observable<Profile> {
    return this.httpClient.get<Profile>(`${this.profileApiUrl}/${username}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get profile request for \'${username}\'.`)),
        map((profile: Profile) => {
          profile.dateBirth = new Date(profile.dateBirth);
          return profile;
        }),
        catchError(this.handleError('getProfile', { } as Profile))
      );
  }

  public saveProfile(profile: Profile): Observable<any> {
    return this.httpClient.put(`${this.profileApiUrl}/${profile.username}`, profile, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing update profile request for \'${profile.username}\'.`)),
      catchError(this.handleError('saveProfile', { } as Profile))
    );
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
