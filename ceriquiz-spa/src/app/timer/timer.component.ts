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
    timer(0, 10).subscribe(ellapsedCycles => {
      if (this.toggle) {
        this.ticks++;
        this.timerValue = {
          milliseconds: Math.floor(this.ticks % 360000 % 6000 % 100),
          seconds: Math.floor(this.ticks % 360000 % 6000 / 100),
          minutes: Math.floor(this.ticks % 360000 / 6000),
          hours: Math.floor(this.ticks / 360000)
        };
      }
    });
  }

  public toString(): string {
    return `${this.numberPipe.transform(this.timerValue.hours, '2.0-0')}:${this.numberPipe.transform(this.timerValue.minutes, '2.0-0')}:${this.numberPipe.transform(this.timerValue.seconds, '2.0-0')}.${this.numberPipe.transform(this.timerValue.milliseconds, '2.0-0')}`;
  }

  public reset(): void {
    this.ticks = 0;
    this.timerValue = {
      milliseconds: 0,
      seconds: 0,
      minutes: 0,
      hours: 0
    };
  }

}
