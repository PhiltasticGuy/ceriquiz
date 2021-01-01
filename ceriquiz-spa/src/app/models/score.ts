export default interface Score {
  id: number;
  username: string;
  date: Date;
  difficulty: number;
  correctAnswers: number;
  timeInSeconds: number;
  score: number;
}