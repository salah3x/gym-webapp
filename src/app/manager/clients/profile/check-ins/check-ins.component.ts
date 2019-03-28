import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import 'cal-heatmap';

import { CheckIn } from 'src/app/shared/client.model';

@Component({
  selector: 'app-check-ins',
  templateUrl: './check-ins.component.html',
  styleUrls: ['./check-ins.component.css']
})
export class CheckInsComponent implements OnInit {

  @Input() id: string;
  cal = new CalHeatMap();
  isFirstTime = true;
  curentStartDate = new Date(`${new Date().getFullYear() - 1}/${new Date().getMonth() + 2}/1`);
  startDate = new Subject<Date>();
  isLoading = false;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
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
        legendColors: ['#ffb3b3', '#b30000'],
        displayLegend: false,
        itemName: 'session',
        subDomainTextFormat: (date: number, value: number) => {
          return value > 0 ? '' : new Date(date).getDate().toString();
        },
        animationDuration: 500,
        subDomainTitleFormat: {
          empty: 'No training session',
          filled: 'Training sessions : {count}'
        }
      });
      this.isLoading = false;
    }, () => this.isLoading = false);
    // Emmit the first event
    this.startDate.next(this.curentStartDate);
  }

  onNext() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() + 1);
    this.cal.next(1);
    this.startDate.next(this.curentStartDate);
  }

  onPrevious() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 1);
    this.cal.previous();
    this.startDate.next(this.curentStartDate);
  }
}
