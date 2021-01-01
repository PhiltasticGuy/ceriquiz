import { Component, OnInit } from '@angular/core';
import RankedPlayer from '../models/ranked-player';
import { ProfileService } from '../profile/profile.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-top10',
  templateUrl: './top10.component.html',
  styleUrls: ['./top10.component.scss']
})
export class Top10Component implements OnInit {
  
  public players: RankedPlayer[];

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.getTop10Players().subscribe(value => this.players = value);
  }

  trackById(index: number, item: RankedPlayer): string {
    return `${index}_${item.username}_${item.score}`;
  }

}
