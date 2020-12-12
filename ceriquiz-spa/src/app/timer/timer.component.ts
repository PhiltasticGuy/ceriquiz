import { Component, OnInit, Input } from '@angular/core';
import { timer } from 'rxjs';
import { DecimalPipe } from '@angular/common';

interface TimerValue {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  private ticks = 0;
  public timerValue: TimerValue = {
    milliseconds: 0,
    seconds: 0,
    minutes: 0,
    hours: 0
  };

  @Input()
  public toggle: boolean;

  constructor(private numberPipe: DecimalPipe) { }

  ngOnInit(): void {
    // S'enregistrer aux updates de "chronomètre" qui émet des valeurs à chaque
    // intervales de 10 centièmes de seconde.
    timer(0, 10).subscribe(elapsed => {
      // Seulement compter le 'tick' du chronomètre si son état est 'actif'.
      if (this.toggle) {
        this.ticks++;

        // Calculer les unités de temps pour ce 'tick' du chronomètre.
        this.timerValue = {
          milliseconds: Math.floor(this.ticks % 360000 % 6000 % 100),
          seconds: Math.floor(this.ticks % 360000 % 6000 / 100),
          minutes: Math.floor(this.ticks % 360000 / 6000),
          hours: Math.floor(this.ticks / 360000)
        };
      }
    });
  }
  
  /**
   * Remise à zéro du chronomètre.
   */
  public reset(): void {
    this.ticks = 0;
    this.timerValue = {
      milliseconds: 0,
      seconds: 0,
      minutes: 0,
      hours: 0
    };
  }

  /**
   * Transformer la valeur du chronomètre pour l'affichage.
   * 
   * @returns: Valeur du chronomètre transformée.
   */
  public toString(): string {
    return `${this.numberPipe.transform(this.timerValue.hours, '2.0-0')}:${this.numberPipe.transform(this.timerValue.minutes, '2.0-0')}:${this.numberPipe.transform(this.timerValue.seconds, '2.0-0')}.${this.numberPipe.transform(this.timerValue.milliseconds, '2.0-0')}`;
  }

}
