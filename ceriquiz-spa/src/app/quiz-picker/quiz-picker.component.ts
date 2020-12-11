import { Component, OnInit } from '@angular/core';
import { QuizService } from './quiz.service';
import { Quiz, Question, DifficultyTypes } from './quiz';
import { TimerComponent } from '../timer/timer.component';

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
  public difficulty: DifficultyTypes;
  public isQuizStarted = false;
  public isTimerRunning = false;
  public currentQuestionIndex: number;
  public selectedAnswer: number;
  public correctAnswer: number;

  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
    this.quizService.getQuizList().subscribe((quizList: Quiz[]) => {
      this.quizList = quizList;
    });
  }

  public onClick(quiz: Quiz): void {
    this.quizId = quiz.id;
    this.quizTheme = quiz.theme;
  }

  public displayDifficulty(): string {
    if (this.difficulty === 'easy') {
      return 'Facile';
    }
    else if (this.difficulty === 'medium') {
      return 'Intermédiaire';
    }
    else if (this.difficulty === 'hard') {
      return 'Difficile';
    }
    else {
      return 'Aucune sélection...';
    }
  }

  public onStartQuiz(quizId: string, difficulty: DifficultyTypes): void {
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

  public checkQuizStarted(timer: TimerComponent): boolean {
    this.isTimerRunning = true;
    return this.isQuizStarted;
  }

  public onCheckAnswer(quizId: string, questionIndex: number, answerKey: number, timer: TimerComponent): void {
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
    });
  }

  public onNextQuestion(timer: TimerComponent): void {
    this.currentQuestionIndex++;
    this.selectedAnswer = undefined;
    this.correctAnswer = undefined;

    this.isTimerRunning = true;
  }

  public onViewResults(timer: TimerComponent): void {
    this.isTimerRunning = false;
  }

  public toQuestionNumber(key: string): number {
    return Number(key) + 1;
  }

}
