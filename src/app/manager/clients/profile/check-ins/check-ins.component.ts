import { Component, OnInit, Input, ViewChild, ElementRef, Inject, LOCALE_ID, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Subject } from 'rxjs';
import { switchMap, debounceTime, takeUntil } from 'rxjs/operators';
import 'cal-heatmap';

import { CheckIn } from 'src/app/shared/client.model';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-check-ins',
  templateUrl: './check-ins.component.html',
  styleUrls: ['./check-ins.component.css']
})
export class CheckInsComponent implements OnInit, OnDestroy {

  @ViewChild('i18n') public i18n: ElementRef;
  @Input() id: string;
  cal = new CalHeatMap();
  isFirstTime = true;
  curentStartDate = new Date();
  startDate = new Subject<Date>();
  isLoading = false;
  @ViewChild('c') calendar: ElementRef;
  private ngUnsubscribe = new Subject();

  constructor(private afs: AngularFirestore,
              private snack: MatSnackBar,
              @Inject(LOCALE_ID) protected locale: string) { }

  ngOnInit() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 11, 1);
    this.curentStartDate.setHours(0, 0, 0);
    this.startDate.pipe(
      debounceTime(500),
      switchMap(date => {
        this.isLoading = true;
        const startTimestamp = firestore.Timestamp.fromDate(date);
        const endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 12, 0);
        endDate.setHours(23, 59, 59);
        const endTimestamp = firestore.Timestamp.fromDate(endDate);
        return this.afs.collection<CheckIn>(`clients/${this.id}/checkins`, ref =>
          ref.where('date', '>=', startTimestamp).where('date', '<=', endTimestamp)
        ).valueChanges();
      }),
      takeUntil(this.ngUnsubscribe)
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
        domainLabelFormat: (date: Date) => date.toLocaleDateString(this.locale, { month: 'short', year: 'numeric'}),
        subDomainDateFormat: (date: Date) => date.toLocaleDateString(this.locale,
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        subDomainTitleFormat: {
          filled: '{count} {name} - {date}'
        },
        legend: [1, 2, 3, 4],
        legendColors: ['#B9A0FB', '#1B0063'],
        displayLegend: false,
        itemName: 'session',
        animationDuration: 300,
        onComplete: () => setTimeout(() => this.calendar.nativeElement.scrollLeft = 1500, 100)
      });
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', { duration: 4000 });
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
