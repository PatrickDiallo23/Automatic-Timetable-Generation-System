import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.css'],
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() duration: number | undefined = 0; // Problem duration in minutes

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  private countdownSubscription: Subscription | undefined;

  constructor() {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  private startCountdown(): void {
    if(this.duration){
    const countdownInterval = interval(1000); // Update every second
    var totalSeconds = Math.max(0, this.duration * 60); // Convert duration to seconds

    this.countdownSubscription = countdownInterval.subscribe(() => {
      if (totalSeconds <= 0) {
        this.countdownSubscription?.unsubscribe(); // Stop the countdown
      } else {
        this.hours = Math.floor(totalSeconds / 3600);
        this.minutes = Math.floor((totalSeconds % 3600) / 60);
        this.seconds = totalSeconds % 60;
        totalSeconds--;
      }
    });
    }
  }
}
