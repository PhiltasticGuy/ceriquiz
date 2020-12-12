export default interface Profile {
  username: string;
  firstname: string;
  lastname: string;
  dateBirth: Date;
  avatarUrl: string;
  status: string;
  isConnected: boolean;
}

export interface Score {
  username: string;
  date: Date;
  difficulty: number;
  correctAnswers: number;
  timeInSeconds: number;
  score: number;
}