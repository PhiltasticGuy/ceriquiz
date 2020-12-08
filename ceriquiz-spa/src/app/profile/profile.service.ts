import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Profile from './profile';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // private authApiUrl = 'http://pedago.univ-avignon.fr:3021/auth/login';
  private profileApiUrl = 'http://127.0.0.1:3021/profile';

  // Options pour les HTTP Headers utilisées lors des requêtes HTTP.
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  public getProfile(username: string): Observable<Profile> {
    return this.httpClient.get<Profile>(`${this.profileApiUrl}/${username}`)
      .pipe(
        map((profile: Profile) => {
          profile.dateBirth = new Date(profile.dateBirth);
          return profile;
        })
      );
  }
}
