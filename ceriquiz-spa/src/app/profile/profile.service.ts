import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import Profile, { Score } from './profile';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private profileApiUrl = 'http://pedago.univ-avignon.fr:3021/api/profile';
  private profileApiUrl = 'http://127.0.0.1:3021/api/profile';

  // Options pour les HTTP Headers utilisées lors des requêtes HTTP.
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  /**
   * Charger le profil de l'utilisateur.
   *
   * @param username: Identifiant de l'utilisateur.
   * @returns: Observable du profil de l'utilisateur.
   */
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

  /**
   * Modifier le profil de l'utilisateur.
   *
   * @param profile: Profil modifié de l'utilisateur.
   * @returns: Observable du profil de l'utilisateur modifié.
   */
  public saveProfile(profile: Profile): Observable<Profile> {
    return this.httpClient.put<Profile>(`${this.profileApiUrl}/${profile.username}`, profile, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing update profile request for \'${profile.username}\'.`)),
      catchError(this.handleError('saveProfile', {} as Profile))
    );
  }

  /**
   * Charger l'historique des scores de l'utilisateur.
   *
   * @param username: Identifiant de l'utilisateur.
   * @returns: Observable de l'historique des scores.
   */
  // TODO: Imbriquer cette information dans la fonction getProfile()?
  public getScoreLog(username: string): Observable<Score[]> {
    return this.httpClient.get<Score[]>(`${this.profileApiUrl}/${username}/score`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get score log request for \'${username}\'.`)),
        catchError(this.handleError('getScoreLog', [] as Score[]))
      );
  }

  /**
   * Sauvegarder un score de l'utilisateur dans son historique.
   *
   * @param score: Score pour une partie de quiz.
   * @returns: Observable du score sauvegardé.
   */
  public saveScore(score: Score): Observable<Score> {
    const url = `${this.profileApiUrl}/${score.username}/score`;
    return this.httpClient.post<Score>(url, score, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing save score request for username \'${score.username}\'.`)),
      catchError(this.handleError('saveScore', {} as Score))
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
