import { Component, OnInit } from '@angular/core';
import { QuizService } from './quiz.service';
import { Quiz, Question, DifficultyTypes } from './quiz';
import { TimerComponent } from '../timer/timer.component';
import { Router } from '@angular/router';
import { ProfileService } from '../profile/profile.service';
import { Score } from '../profile/profile';
import LoginResponse from '../authentication/login-response';

@Component({
  selector: 'app-quiz-picker',
  templateUrl: './quiz-picker.component.html',
  styleUrls: ['./quiz-picker.component.scss']
})
export class QuizPickerComponent implements OnInit {
  public quizList: Quiz[] = [];
  public questions: Question[] = [];
  public quizId: string;
  public quizTheme: string;
  public difficulty: string;
  public isQuizStarted = false;
  public isTimerRunning = false;
  public currentQuestionIndex: number;
  public selectedAnswer: number;
  public correctAnswer: number;
  public isQuizFinished = false;
  public correctAnswers: number = 0;
  public finalTime: string;
  public score: number = 0;

  constructor(private quizService: QuizService, private profileService: ProfileService, private router: Router) { }

  ngOnInit(): void {
    this.onResetQuizList();
  }

  public onClick(quiz: Quiz): void {
    this.quizId = quiz.id;
    this.quizTheme = quiz.theme;
  }

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

  public onStartQuiz(quizId: string, difficulty: string): void {
    this.quizService.getQuestionsByDifficulty(quizId, difficulty).subscribe((questions: Question[]) => {
      console.log(JSON.stringify(questions));

      this.questions = questions;
      this.currentQuestionIndex = 0;
      this.isQuizStarted = true;
      this.isTimerRunning = true;
    });
  }

  public onCancel(): void {
    console.log(`Cancelling quiz \'${this.quizId}\', theme \'${this.quizTheme}\' and difficulty \'${this.difficulty}\'.`);
    this.quizId = undefined;
    this.quizTheme = undefined;
    this.difficulty = undefined;
  }

  public checkQuizStarted(): boolean {
    this.isTimerRunning = true;
    return this.isQuizStarted;
  }

  public onCheckAnswer(quizId: string, questionIndex: number, answerKey: number): void {
    this.isTimerRunning = false;

    this.quizService
    .checkAnswer(
      quizId,
      this.questions[questionIndex].id,
      this.questions[questionIndex].options[answerKey])
    .subscribe(value => {
      console.log('Is correct answer? ' + (value.answer === this.questions[questionIndex].options[answerKey]));
      this.correctAnswer = this.questions[questionIndex].options.indexOf(value.answer);
      this.selectedAnswer = answerKey;

      if (value.answer === this.questions[questionIndex].options[answerKey]) {
        this.correctAnswers++;
      }
    });
  }

  public onNextQuestion(): void {
    this.currentQuestionIndex++;
    this.selectedAnswer = undefined;
    this.correctAnswer = undefined;

    this.isTimerRunning = true;
  }

  public onViewResults(timer: TimerComponent): void {
    this.isQuizFinished = true;

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

    // Score de base.
    const baseScore = (this.correctAnswers * 500);

    // 100 points bonus par seconde sous la barre des 7 secondes par question, sinon zéro.
    const totalSeconds = (timer.timerValue.hours * 3600 + timer.timerValue.minutes * 60 + timer.timerValue.seconds + timer.timerValue.milliseconds / 100);
    const timeBonusThreshold = this.correctAnswers * 7;
    const timeBonus = (timeBonusThreshold - totalSeconds > 0 && this.correctAnswers > 0 ? (timeBonusThreshold - totalSeconds) * 100 : 0);

    this.finalTime = timer.toString();
    this.score = Math.floor(((baseScore + timeBonus) * difficultyBonus) / 10) * 10;

    const session: LoginResponse = JSON.parse(localStorage.getItem('session'));
    const data = {
      username: session.username,
      date: new Date(),
      difficulty: Number(this.difficulty),
      correctAnswers: this.correctAnswers,
      score: this.score,
      timeInSeconds: totalSeconds
    } as Score;
    this.profileService.saveScore(data).subscribe();

    timer.reset();
  }

  public toQuestionNumber(key: string): number {
    return Number(key) + 1;
  }

  public onGoToDashboard(): void {
    this.router.navigate(['dashboard']);
  }

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

    this.quizService.getQuizList().subscribe((quizList: Quiz[]) => {
      this.quizList = quizList;
    });
  }
}
