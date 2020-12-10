export interface Quiz {
  id: string;
  provider: string;
  writer: string;
  theme: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  funFact: string;
}

export interface CorrectAnswer {
  answer: string;
}
