import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Quiz, Question, CorrectAnswer, DifficultyTypes } from './quiz';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  // private quizApiUrl = 'http://pedago.univ-avignon.fr:3021/api/quiz';
  private quizApiUrl = 'http://127.0.0.1:3021/api/quiz';

  // Options pour les HTTP Headers utilisées lors des requêtes HTTP.
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  /**
   * Charger la liste des quiz.
   *
   * @returns: Observable de la liste des quiz.
   */
  public getQuizList(): Observable<Quiz[]> {
    const url = `${this.quizApiUrl}`;
    return this.httpClient.get<Quiz[]>(url, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing get quiz list request.`)),
      catchError(this.handleError('getQuizList', [] as Quiz[]))
    );
  }

  /**
   * Charger la liste des questions pour une partie de quiz.
   *
   * @param quizId: Identifiant du quiz sélectionné.
   * @param difficulty: Niveau de difficulté sélectionné.
   * @returns: Observable de la liste de questions du quiz.
   */
  public getQuestionsByDifficulty(quizId: string, difficulty: string): Observable<Question[]> {
    const url = `${this.quizApiUrl}/${quizId}/questions?difficulty=${difficulty}`;
    return this.httpClient.get<Question[]>(url, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing get questions request for quiz \'${quizId}\'.`)),
      catchError(this.handleError('getQuestionsByDifficulty', [] as Question[]))
    );
  }

  /**
   * Charger la réponse correcte pour une question spécifique d'un quiz.
   *
   * @param quizId: Identifiant du quiz sélectionné.
   * @param questionId: Identifiant de la question actuelle du quiz.
   * @returns: Observable de la réponse correcte.
   */
  public getCorrectAnswer(quizId: string, questionId: number): Observable<CorrectAnswer> {
    const url = `${this.quizApiUrl}/${quizId}/questions/${questionId}}`;
    return this.httpClient.get<CorrectAnswer>(url, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing get correct answer request for quiz \'${quizId}\' and question \'${questionId}\'.`)),
      catchError(this.handleError('getCorrectAnswer', {} as CorrectAnswer))
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
