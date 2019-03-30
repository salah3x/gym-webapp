import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, switchMap, map, tap } from 'rxjs/operators';

import { ChargeAddComponent } from './charge-add/charge-add.component';
import { Payment, Charge } from 'src/app/shared/client.model';
import { ListViewComponent } from './list-view/list-view.component';

@Component({
  selector: 'app-charges-payments',
  templateUrl: './charges-payments.component.html',
  styleUrls: ['./charges-payments.component.css']
})
export class ChargesPaymentsComponent implements OnInit {

  monthToShow = 6;
  curentStartDate = new Date();
  curentEndDate = new Date();
  startDate$ = new Subject<{ start: Date, end: Date }>();
  barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  barChartLabels: Label[] = [];
  barChartData: ChartDataSets[] = [
    { data: [], label: 'Payments', backgroundColor: '#4CAF50', hoverBackgroundColor: '#388E3C', borderColor: '#9E9E9E' },
    { data: [], label: 'Charges', backgroundColor: '#FF5252', hoverBackgroundColor: '#D32F2F', borderColor: '#9E9E9E' }
  ];

  constructor(private dialog: MatDialog,
              private afs: AngularFirestore,
              private snack: MatSnackBar) { }

  ngOnInit() {
    this.startDate$.pipe(
      tap(() => {
        this.barChartData[0].data = [];
        this.barChartData[1].data = [];
      }),
      debounceTime(500),
      switchMap(data => combineLatest(
        this.afs.collection<Payment>('payments', ref => ref
          .where('date', '>=', firestore.Timestamp.fromDate(data.start))
          .where('date', '<=', firestore.Timestamp.fromDate(data.end))
        ).valueChanges().pipe(
          map(ps => {
            const arr: number[] = new Array(this.monthToShow).fill(0);
            ps.forEach(item =>
              (arr[this.barChartLabels.indexOf(item.date.toDate().toLocaleString('en-us', { month: 'long', year: 'numeric' }))] as number)
              += item.price);
            return arr;
          })
        ),
        this.afs.collection<Charge>('charges', ref => ref
          .where('date', '>=', firestore.Timestamp.fromDate(data.start))
          .where('date', '<=', firestore.Timestamp.fromDate(data.end))
        ).valueChanges().pipe(
          map(ps => {
            const arr: number[] = new Array(this.monthToShow).fill(0);
            ps.forEach(item =>
              (arr[this.barChartLabels.indexOf(item.date.toDate().toLocaleString('en-us', { month: 'long', year: 'numeric' }))] as number)
              += item.cost);
            return arr;
          })
        )
      ))
    ).subscribe(data => {
      this.barChartData[0].data = data[0];
      this.barChartData[1].data = data[1];
    }, () => this.snack.open('Failed loading data', 'Close', { duration: 2000 }));
    this.curentStartDate.setHours(0, 0, 0);
    this.curentEndDate.setMonth(this.curentEndDate.getMonth() + 1, 0);
    this.curentEndDate.setHours(23, 59, 59);
    this.initLabels();
    this.startDate$.next({ start: this.curentStartDate, end: this.curentEndDate });
  }

  initLabels() {
    for (let i = 0; i < this.monthToShow; i++) {
      this.barChartLabels.unshift(this.curentStartDate.toLocaleString('en-us', { month: 'long', year: 'numeric' }));
      if (i === this.monthToShow - 1) {
        continue;
      }
      this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 1, 1);
    }
  }

  onNext() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() + 1);
    this.curentEndDate.setMonth(this.curentEndDate.getMonth() + 2, 0);
    this.startDate$.next({ start: this.curentStartDate, end: this.curentEndDate });
    this.barChartLabels.shift();
    this.barChartLabels.push(this.curentEndDate.toLocaleString('en-us', { month: 'long', year: 'numeric' }));
  }

  onPrevious() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 1);
    this.curentEndDate.setDate(0);
    this.startDate$.next({ start: this.curentStartDate, end: this.curentEndDate });
    this.barChartLabels.pop();
    this.barChartLabels.unshift(this.curentStartDate.toLocaleString('en-us', { month: 'long', year: 'numeric' }));
  }

  chartClicked(event: any) {
    if (event.active.length !== 0) {
      this.dialog.open(ListViewComponent, {
        width: '80%',
        data: this.barChartLabels[event.active[0]._index]
      });
    }
  }

  openNewChargeDialog() {
    this.dialog.open(ChargeAddComponent, {
      width: '400px'
    });
  }

  toMonths(array: Payment[] | Charge[]): number[] {
    const newArray = Array(this.monthToShow);
    (array as any[]).forEach((item: any) => {
      if (this.isPayment(item)) {
        (newArray[this.barChartLabels.indexOf(item.date.toDate().toLocaleString('en-us', { month: 'long', year: 'numeric' }))] as number)
          += item.price;
      } else if (this.isCharge(item)) {
        (newArray[this.barChartLabels.indexOf(item.date.toDate().toLocaleString('en-us', { month: 'long', year: 'numeric' }))] as number)
          += item.cost;
      }
    });
    return newArray;
  }

  isPayment(arg: any): arg is Payment {
    return arg.price !== undefined;
  }

  isCharge(arg: any): arg is Charge {
    return arg.cost !== undefined;
  }
}
