import { Component, OnInit } from '@angular/core';
import { QuizService } from './quiz.service';
import { Quiz, Question } from './quiz';

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
  public difficulty: 'easy' | 'medium' | 'hard';
  public isQuizStarted = false;
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

  public onStartQuiz(quizId: string, difficulty: string): void {
    this.quizService.getQuestions(quizId).subscribe((questions: Question[]) => {
      console.log(JSON.stringify(questions));
      this.questions = questions;
      this.isQuizStarted = true;
      this.currentQuestionIndex = 0;
    });
  }

  public onCancel(): void {
    console.log(`Cancelling quiz \'${this.quizId}\', theme \'${this.quizTheme}\' and difficulty \'${this.difficulty}\'.`);
    this.quizId = undefined;
    this.quizTheme = undefined;
    this.difficulty = undefined;
  }

  public onCheckAnswer(quizId: string, questionIndex: number, answerKey: number): void {
    // TODO: Pause timer.

    console.log(`Checking answer for quiz \'${quizId}\', question \'${questionIndex}\' and answer \'${answerKey}\'.`);
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

  public onNextQuestion(): void {
    this.currentQuestionIndex++;
    this.selectedAnswer = undefined;
    this.correctAnswer = undefined;

    // TODO: Unpause timer.
  }

}
