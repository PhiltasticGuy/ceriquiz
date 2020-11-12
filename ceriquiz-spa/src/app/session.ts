import { Timestamp } from 'rxjs';

export default interface Session {
  username: string;
  firstname: string;
  lastname: string;
  lastLogin: Date;
}
