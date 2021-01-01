import { Component, OnInit } from '@angular/core';
import { QuizService } from './quiz.service';
import { TimerComponent } from '../timer/timer.component';
import { Router } from '@angular/router';
import { ProfileService } from '../profile/profile.service';
import Score from '../models/score';
import LoginResponse from '../models/login-response';
import { Quiz, Question } from '../models/quiz';

// TODO: Découper ce code en plusieurs components spécialisés?

@Component({
  selector: 'app-quiz-picker',
  templateUrl: './quiz-picker.component.html',
  styleUrls: ['./quiz-picker.component.scss']
})
export class QuizPickerComponent implements OnInit {
  // Section: Quiz Picker
  public quizList: Quiz[] = [];
  public questions: Question[] = [];
  public quizId: string;
  public quizTheme: string;
  public difficulty: string;

  // Section: Quiz Game
  public isQuizStarted = false;
  public isTimerRunning = false;
  public currentQuestionIndex: number;
  public selectedAnswer: number;
  public correctAnswer: number;
  
  // Section: Quiz Results
  public isQuizFinished = false;
  public correctAnswers: number = 0;
  public finalTime: string;
  public score: number = 0;

  constructor(private quizService: QuizService, private profileService: ProfileService, private router: Router) { }

  ngOnInit(): void {
    this.onResetQuizList();
  }

  /**
   * Noter le choix de quiz et basculer l'écran au choix du niveau de difficulté.
   * 
   * @param quiz: Quiz choisi.
   */
  public onClick(quiz: Quiz): void {
    this.quizId = quiz.id;
    this.quizTheme = quiz.theme;
  }

  /**
   * Transformation du niveau de difficulté pour l'affichage.
   *
   * @returns: Niveau de difficulté formatté.
   */
  public displayDifficulty(): string {
    if (this.difficulty === '1') {
      return 'Facile';
    }
    else if (this.difficulty === '2') {
      return 'Intermédiaire';
    }
    else if (this.difficulty === '3') {
      return 'Difficile';
    }
    else {
      return 'Aucune sélection...';
    }
  }

  /**
   * Lancer la partie de quiz.
   * 
   * @param quizId: Identifiant du quiz choisi.
   * @param difficulty: Niveau de difficulté choisi.
   */
  public onStartQuiz(quizId: string, difficulty: string): void {
    // Charger les questions pour cette combinaison de quiz et de niveau de
    // difficulté.
    this.quizService.getQuestionsByDifficulty(quizId, difficulty)
    .subscribe((questions: Question[]) => {
      console.log(JSON.stringify(questions));

      // Assigner les questions et commencer à la première question.
      this.questions = questions;
      this.currentQuestionIndex = 0;

      // Signaler le début de la partie de quiz.
      this.isQuizStarted = true;

      // Lancer le chronomètre!
      this.isTimerRunning = true;
    });
  }

  /**
   * Relancer l'écran au début de la sélection de quiz.
   */
  public onCancel(): void {
    console.log(`Cancelling quiz \'${this.quizId}\', theme \'${this.quizTheme}\' and difficulty \'${this.difficulty}\'.`);

    // Réinitializer les choix d'options pour la partie de quiz.
    this.quizId = undefined;
    this.quizTheme = undefined;
    this.difficulty = '1';
  }

  /**
   * Déterminer si la partie de quiz est lancée, en plus de lancer le chronomètre.
   * 
   * @returns: Valeur indiquant si la partie de quiz est lancée.
   */
  public checkQuizStarted(): boolean {
    // S'assurer que le chronomètre est bien lancé au début de la partie de quiz.
    this.isTimerRunning = true;
    
    return this.isQuizStarted;
  }

  /**
   * Valider la réponse choisie par l'utilisateur pour cette question.
   *
   * @param quizId: Identifiant du quiz actuel.
   * @param questionIndex: Index de la question dans le tableau local.
   * @param answerKey: Clé de l'option choisie.
   */
  public onCheckAnswer(quizId: string, questionIndex: number, answerKey: number): void {
    // Arrêter le chronomètre le temps d'afficher le résultat de cette question
    // à l'utilisateur et lui permettre de lire l'anecdote.
    this.isTimerRunning = false;

    // Charger la réponse correcte de l'API.
    this.quizService
    .getCorrectAnswer(
      quizId,
      this.questions[questionIndex].id)
    .subscribe(value => {
      console.log('Is correct answer? ' + (value.answer === this.questions[questionIndex].options[answerKey]));

      // Mettre en évidence la réponse choisie par l'utilisateur et la 
      // réponse correcte.
      this.correctAnswer = this.questions[questionIndex].options.indexOf(value.answer);
      this.selectedAnswer = answerKey;

      // Compter la bonne réponse, si c'est le cas.
      if (value.answer === this.questions[questionIndex].options[answerKey]) {
        this.correctAnswers++;
      }
    });
  }

  /**
   * Afficher la prochaine question du quiz.
   */
  public onNextQuestion(): void {
    this.currentQuestionIndex++;

    // Effacer les valeurs retenues pour la réponse choisie et réponse correcte 
    // de la question précédente.
    this.selectedAnswer = undefined;
    this.correctAnswer = undefined;

    // Relancer le chronomètre puisque la partie continue!
    this.isTimerRunning = true;
  }

  /**
   * Calculer le score final de l'utilisateur pour cette partie de quiz.
   *
   * @param timer: Instance du composant TimerComponent.
   * @returns: Score de l'utilisateur.
   */
  private calculateScore(timer: TimerComponent): Score {
    // Score de base.
    const baseScore = (this.correctAnswers * 750);

    // Score bonus pour le temps.
    // 100 points bonus par seconde sous la barre des 7 secondes par question, sinon zéro.
    const totalSeconds = (timer.timerValue.hours * 3600 + timer.timerValue.minutes * 60 + timer.timerValue.seconds + timer.timerValue.milliseconds / 100);
    const timeBonusThreshold = this.correctAnswers * 7;
    const timeBonus = (timeBonusThreshold - totalSeconds > 0 && this.correctAnswers > 0 ? (timeBonusThreshold - totalSeconds) * 100 : 0);

    // Multiplicateur bonus pour le niveau de difficulté.
    let difficultyBonus: number;
    if (this.difficulty === '1') {
      difficultyBonus = 1.1;
    }
    else if(this.difficulty === '2') {
      difficultyBonus = 1.2;
    }
    else {
      difficultyBonus = 1.3;
    }

    // Fixer le score final.
    this.score = Math.floor(((baseScore + timeBonus) * difficultyBonus) / 10) * 10;

    // Fixer le temps final du chronomètre.
    this.finalTime = timer.toString();

    // Construire le record 'score' pour l'historique de l'utilisateur.
    const session: LoginResponse = JSON.parse(localStorage.getItem('session'));
    const data = {
      username: session.username,
      date: new Date(),
      difficulty: Number(this.difficulty),
      correctAnswers: this.correctAnswers,
      score: this.score,
      timeInSeconds: totalSeconds
    } as Score;

    return data;
  }

  /**
   * Afficher l'écran des résultats pour la partie jouée.
   *
   * @param timer: Instance du composant TimerComponent.
   */
  public onViewResults(timer: TimerComponent): void {
    // Signaler la fin de la partie de quiz.
    this.isQuizFinished = true;

    // Calculer et sauvegarder le score de l'utilisateur.
    const score = this.calculateScore(timer);
    this.profileService.saveScore(score).subscribe();

    // Remettre le chronomètre à zéro au cas où l'utilisateur décide de jouer
    // une nouvelle partie.
    timer.reset();
  }

  /**
   * Transformation de la clé de la question courante pour l'affichage.
   *   (i.e. 1-based au lieu de 0-based).
   *
   * @param key: Clé de la question affichée.
   * @returns: Clé de la question affichée, formattée.
   */
  public toQuestionNumber(key: string): number {
    return Number(key) + 1;
  }

  /**
   * Rediriger l'utilisateur vers l'écran du tableau de bord.
   */
  public onGoToDashboard(): void {
    this.router.navigate(['dashboard']);
  }

  /**
   * Réinitialiser l'écran et relancer au début de la sélection de quiz.
   */
  public onResetQuizList(): void {
    this.quizList = [];
    this.questions = [];
    this.quizId = undefined;
    this.quizTheme = undefined;
    this.difficulty = '1';
    this.isQuizStarted = false;
    this.isTimerRunning = false;
    this.currentQuestionIndex = undefined;
    this.selectedAnswer = undefined;
    this.correctAnswer = undefined;
    this.isQuizFinished = false;
    this.correctAnswers = 0;
    this.finalTime = undefined;
    this.score = 0;

    // Charger la liste des quiz disponibles.
    this.quizService.getQuizList().subscribe((quizList: Quiz[]) => {
      this.quizList = quizList;
    });
  }
}
