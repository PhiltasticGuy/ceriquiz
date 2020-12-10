import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Quiz, Question, CorrectAnswer } from './quiz';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

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

  public getQuizList(): Observable<Quiz[]> {
    const url = `${this.quizApiUrl}`;
    return this.httpClient.get<Quiz[]>(url, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing get quiz list request.`)),
      catchError(this.handleError('getQuizList', [] as Quiz[]))
    );
  }

  public getQuestions(quizId: string): Observable<Question[]> {
    const url = `${this.quizApiUrl}/${quizId}/questions`;
    return this.httpClient.get<Question[]>(url, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing get questions request for quiz \'${quizId}\'.`)),
      catchError(this.handleError('getQuizList', [] as Question[]))
    );
  }

  public getQuestionsByDifficulty(quizId: string, difficulty: number): Question[] {
    return [] as Question[];
  }

  public checkAnswer(quizId: string, questionId: number, answer: string): Observable<CorrectAnswer> {
    const url = `${this.quizApiUrl}/${quizId}/questions/${questionId}?answer=${encodeURI(answer)}`;
    return this.httpClient.get<CorrectAnswer>(url, this.httpOptions)
    .pipe(
      tap(_ => console.log(`Processing check answer request for quiz \'${quizId}\', question \'${questionId}\' and answer \'${answer}\'.`)),
      catchError(this.handleError('checkAnswer', {} as CorrectAnswer))
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
