import { Component, OnInit } from '@angular/core';
import { Player } from '../models/player';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-online-players',
  templateUrl: './online-players.component.html',
  styleUrls: ['./online-players.component.scss']
})
export class OnlinePlayersComponent implements OnInit {

  public players: Player[];

  constructor(private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.profileService.getOnlinePlayers().subscribe(value => this.players = value);
  }

}
