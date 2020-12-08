import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import Profile from './profile';
import LoginResponse from '../authentication/login-response';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public isEditing = false;
  public tempAvatarUrl = '';
  public profile: Profile;

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    const data: LoginResponse = JSON.parse(localStorage.getItem('session'));
    this.profileService.getProfile(data.username).subscribe(value => {
      this.profile = value;
      this.tempAvatarUrl = this.profile.avatarUrl;
    });
  }

  public formatDate(value: Date): string {
    return value.toLocaleString('fr', { year: 'numeric', month: 'numeric', day: 'numeric' });
  }

  public setBirthday(value: any): void {
    this.profile.dateBirth = new Date(value);
  }

  public startEditing(): void {
    this.isEditing = true;
  }

  public saveProfile(f: NgForm): void {
    this.isEditing = false;
    this.profile.avatarUrl = this.tempAvatarUrl;
  }

}
