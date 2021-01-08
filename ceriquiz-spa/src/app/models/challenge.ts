import { Question } from './quiz';

export interface Challenge {
  id: string;
  gameId: number;
  challengerUserId: number;
  challengeeUserId: number;
  challengerUsername: string;
  challengeeUsername: string;
  targetScore: number;
  quiz: ChallengeQuiz;
};

export interface ChallengeQuiz {
  id: string;
  theme: string;
  difficulty: string;
  questions: Question[];
}