import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import Profile from '../models/profile';
import Score from '../models/score';
import RankedPlayer from '../models/ranked-player';
import { Player } from '../models/player';
import { io, Socket } from 'socket.io-client';
import { Challenge } from '../models/challenge';
import LoginResponse from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private baseUrl = 'http://pedago.univ-avignon.fr:3021';
  private baseUrl = 'http://127.0.0.1:3021';
  private profileApiUrl = `${this.baseUrl}/api/profile`;
  private playersApiUrl = `${this.baseUrl}/api/players`;

  // Options pour les HTTP Headers utilisées lors des requêtes HTTP.
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private socket: Socket;
  private top10Players: BehaviorSubject<RankedPlayer[]>;
  private onlinePlayers: BehaviorSubject<Player[]>;
  private challenges: BehaviorSubject<Challenge[]>;

  constructor(private httpClient: HttpClient) {
    this.socket = io(this.baseUrl);
    this.top10Players = new BehaviorSubject<RankedPlayer[]>([]);
    this.onlinePlayers = new BehaviorSubject<Player[]>([]);
    this.challenges = new BehaviorSubject<Challenge[]>([]);

    this.socket.on('top10Updated', (data: RankedPlayer[]) => {
      console.log(`top10Updated.data = ${JSON.stringify(data)}`);
      this.setTop10Players(data);
    });

    this.socket.on('playerConnected', (data: Player) => {
      console.log(`playerConnected.data = ${JSON.stringify(data)}`);
      this.onlinePlayers.value.push(data);
      this.onlinePlayers.value.sort((a, b) => a.username.localeCompare(b.username));
      this.setOnlinePlayers(this.onlinePlayers.value);
    });

    this.socket.on('playerDisconnected', (data: number) => {
      console.log(`playerDisconnected.data = ${JSON.stringify(data)}`);
      const filtered = this.onlinePlayers.value.filter(obj => obj.id !== data);
      this.setOnlinePlayers(filtered);
    });

    this.socket.on('playerChallenged', (data: Challenge) => {
      console.log(`playerChallenged.data = ${JSON.stringify(data)}`);
      const currentUserId = (JSON.parse(localStorage.getItem('session')) as LoginResponse).id;
      if (data.challengeeUserId == currentUserId) {
        this.challenges.value.push(data);
        this.setChallenges(this.challenges.value);
      }
    });
  }

  /**
   * Charger le profil de l'utilisateur.
   *
   * @param username: Identifiant de l'utilisateur.
   * @returns: Observable du profil de l'utilisateur.
   */
  public getProfile(userId: number): Observable<Profile> {
    return this.httpClient.get<Profile>(`${this.profileApiUrl}/${userId}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get profile request for \'${userId}\'.`)),
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
  public saveProfile(userId: number, profile: Profile): Observable<Profile> {
    return this.httpClient.put<Profile>(`${this.profileApiUrl}/${userId}`, profile, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing update profile request for \'${userId}\'.`)),
      catchError(this.handleError('saveProfile', {} as Profile))
    );
  }

  /**
   * Sauvegarder un score de l'utilisateur dans son historique.
   *
   * @param score: Score pour une partie de quiz.
   * @returns: Observable du score sauvegardé.
   */
  public saveScore(score: Score): Observable<Score> {
    const url = `${this.profileApiUrl}/${score.id}/score`;
    return this.httpClient.post<Score>(url, score, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing save score request for username \'${score.username}\' (${score.id}).`)),
      catchError(this.handleError('saveScore', {} as Score))
    );
  }

  getTop10PlayersObservable(): Observable<RankedPlayer[]> {
    return this.top10Players.asObservable();
  }

  private setTop10Players(value: RankedPlayer[]): void {
    this.top10Players.next(value);
  }

  /**
   * Charger le top 10 des joueurs.
   * 
   * @returns: Observable du top 10 des joueurs.
   */
  public getTop10Players(): Observable<RankedPlayer[]> {
    this.httpClient.get<RankedPlayer[]>(`${this.playersApiUrl}/top10`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get top 10 request.`)),
        catchError(this.handleError('getTop10', [] as RankedPlayer[]))
      )
      // Lorsqu'on reçoit une réponse, on assigne la valeur à l'observable.
      .subscribe((value: RankedPlayer[]) => this.setTop10Players(value));

    // L'observable de la liste top 10 des joueurs est retourné afin que
    // l'on puisse recevoir ses nouvelles valeurs une fois que l'appel HTTP
    // est traité.
    return this.getTop10PlayersObservable();
  }

  /**
   * Charger la liste de tous les joueurs.
   * 
   * @returns: Observable de la liste de tous les joueurs.
   */
  public getPlayers(): Observable<Player[]> {
    return this.httpClient.get<Player[]>(`${this.playersApiUrl}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get players request.`)),
        catchError(this.handleError('getPlayers', [] as Player[]))
      );
  }

  getOnlinePlayersObservable(): Observable<Player[]> {
    return this.onlinePlayers.asObservable();
  }

  private setOnlinePlayers(value: Player[]): void {
    this.onlinePlayers.next(value);
  }

  /**
   * Charger la liste des joueurs connectés.
   * 
   * @returns: Observable de la liste des joueurs connectés.
   */
  public getOnlinePlayers(): Observable<Player[]> {
    this.httpClient.get<Player[]>(`${this.playersApiUrl}/online`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get online players request.`)),
        catchError(this.handleError('getOnlinePlayers', [] as Player[]))
      )
      // Lorsqu'on reçoit une réponse, on assigne la valeur à l'observable.
      .subscribe((value: Player[]) => this.setOnlinePlayers(value));

    // L'observable de la liste joueurs connectés est retourné afin que
    // l'on puisse recevoir ses nouvelles valeurs une fois que l'appel HTTP
    // est traité.
    return this.getOnlinePlayersObservable();
  }
  
  getChallengesObservable(): Observable<Challenge[]> {
    return this.challenges.asObservable();
  }

  private setChallenges(value: Challenge[]): void {
    this.challenges.next(value);
  }

  /**
   * Charger la liste des défis pour cet utilisateur.
   * 
   * @returns: Observable de la liste des défis pour cet utilisateur.
   */
  public getChallenges(userId: number): Observable<Challenge[]> {
    this.httpClient.get<Challenge[]>(`${this.playersApiUrl}/${userId}/challenges`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Processing get challenge request.`)),
        catchError(this.handleError('getChallenges', [] as Challenge[]))
      )
      // Lorsqu'on reçoit une réponse, on assigne la valeur à l'observable.
      .subscribe((value: Challenge[]) => this.setChallenges(value));

    // L'observable de la liste des défis est retournée afin que
    // l'on puisse recevoir ses nouvelles valeurs une fois que l'appel HTTP
    // est traité.
    return this.getChallengesObservable();
  }

  /**
   * Créer le nouveau défi.
   *
   * @param challenge: Nouveau défi.
   * @returns: Observable du profil de l'utilisateur modifié.
   */
  public saveChallenge(challenge: Challenge): Observable<Challenge> {
    return this.httpClient.post<Challenge>(`${this.playersApiUrl}/challenges`, challenge, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing save challenge request.`)),
      catchError(this.handleError('saveChallenge', {} as Challenge))
    );
  }

  /**
   * Accepter un défi.
   *
   * @param challengeId: Id du défi.
   */
  public acceptChallenge(challengeId: string): void {
    this.socket.emit('playerAcceptedChallenge', challengeId);
    this.setChallenges(this.challenges.value.slice(1));
  }

  /**
   * Refuser un défi.
   *
   * @param challengeId: Id du défi.
   * @returns: Observable du défi refusé.
   */
  public refuseChallenge(challengeId: string): Observable<Challenge[]> {
    this.httpClient.delete<Challenge>(`${this.playersApiUrl}/challenges/${challengeId}`, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing refuse challenge request.`)),
      catchError(this.handleError('refuseChallenge', [] as Challenge[]))
    )
    // Lorsqu'on reçoit une réponse, on assigne la valeur à l'observable.
    .subscribe((value: Challenge) => this.setChallenges(this.challenges.value.slice(1)));

    // L'observable de la liste des défis est retournée afin que
    // l'on puisse recevoir ses nouvelles valeurs une fois que l'appel HTTP
    // est traité.
    return this.getChallengesObservable();
  }

  /**
   * Gagner un défi.
   *
   * @param challengeId: Id du défi.
   */
  public winChallenge(challengeId: string, winnerUserId: number, loserUserId: number): void {
    this.socket.emit('playerWonChallenge', { 'winnerUserId': winnerUserId, 'loserUserId': loserUserId });
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
