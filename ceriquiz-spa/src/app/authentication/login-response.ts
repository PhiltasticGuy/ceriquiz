export default interface LoginResponse {
  authenticated: boolean;
  username: string;
  firstname: string;
  lastname: string;
  lastLoginDate: Date;
}
