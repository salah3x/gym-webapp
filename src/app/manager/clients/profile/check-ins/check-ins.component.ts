import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import 'cal-heatmap';

import { CheckIn } from 'src/app/shared/client.model';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-check-ins',
  templateUrl: './check-ins.component.html',
  styleUrls: ['./check-ins.component.css']
})
export class CheckInsComponent implements OnInit {

  @Input() id: string;
  cal = new CalHeatMap();
  isFirstTime = true;
  curentStartDate = new Date();
  startDate = new Subject<Date>();
  isLoading = false;
  @ViewChild('c') calendar: ElementRef;

  constructor(private afs: AngularFirestore, private snack: MatSnackBar) { }

  ngOnInit() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 11, 1);
    this.curentStartDate.setHours(0, 0, 0);
    this.startDate.pipe(
      debounceTime(500),
      switchMap(date => {
        this.isLoading = true;
        const startTimestamp = firestore.Timestamp.fromDate(date);
        const endDate = new Date(this.curentStartDate);
        endDate.setMonth(endDate.getMonth() + 12, 0);
        const endTimestamp = firestore.Timestamp.fromDate(endDate);
        return this.afs.collection<CheckIn>(`clients/${this.id}/checkins`, ref =>
          ref.where('date', '>=', startTimestamp).where('date', '<=', endTimestamp)
        ).valueChanges();
      })
    ).subscribe(checkins => {
      const d = {};
      checkins.forEach(c => d[c.date.seconds] = 1);
      if (!this.isFirstTime) {
        this.cal.update(d);
        this.isLoading = false;
        return;
      }
      this.isFirstTime = false;
      this.cal.init({
        domain: 'month',
        cellSize: 15,
        cellPadding: 5,
        cellRadius: 4,
        domainMargin: 5,
        start: this.curentStartDate,
        data: d,
        legend: [1, 2, 3, 4],
        legendColors: ['#B9A0FB', '#1B0063'],
        displayLegend: false,
        itemName: 'session',
        subDomainTextFormat: (date: number, value: number) => {
          return value > 0 ? '' : new Date(date).getDate().toString();
        },
        animationDuration: 300,
        tooltip: true,
        subDomainTitleFormat: {
          empty: 'No training sessions',
          filled: '{count} training {name}'
        },
        onComplete: () => setTimeout(() => this.calendar.nativeElement.scrollLeft = 1500, 100)
      });
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.snack.open('Failed getting data', 'close', { duration: 4000 });
    });
    // Emmit the first event
    this.startDate.next(this.curentStartDate);
  }

  onNext() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() + 1);
    this.cal.next();
    this.startDate.next(this.curentStartDate);
    this.calendar.nativeElement.scrollLeft = 1500;
  }

  onPrevious() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 1);
    this.cal.previous();
    this.startDate.next(this.curentStartDate);
    this.calendar.nativeElement.scrollLeft = 0;
  }
}
