import Score from './score';
import { Medal } from './medal';

export default interface Profile {
  username: string;
  firstname: string;
  lastname: string;
  dateBirth: Date;
  avatarUrl: string;
  status: string;
  isConnected: boolean;
  scores: Score[];
  medals: Medal[];
}