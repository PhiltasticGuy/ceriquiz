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
  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
    this.quizService.getQuizList().subscribe((quizList: Quiz[]) => {
      this.quizList = quizList;
    });
  }

  public onClick(id: string): void {
    this.quizService.getQuestions(id).subscribe((questions: Question[]) => {
      console.log(JSON.stringify(questions));
    });
  }

}
