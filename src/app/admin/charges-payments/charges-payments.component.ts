import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, switchMap, map, tap, takeUntil } from 'rxjs/operators';

import { ChargeAddComponent } from './charge-add/charge-add.component';
import { Payment, Charge } from 'src/app/shared/client.model';
import { ListViewComponent } from './list-view/list-view.component';

@Component({
  selector: 'app-charges-payments',
  templateUrl: './charges-payments.component.html',
  styleUrls: ['./charges-payments.component.css']
})
export class ChargesPaymentsComponent implements OnInit, OnDestroy {
  @ViewChild('i18n', { static: true }) public i18n: ElementRef;
  monthToShow = 6;
  curentStartDate = new Date();
  curentEndDate = new Date();
  startDate$ = new Subject<{ start: Date; end: Date }>();
  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'MAD',
            fontFamily: 'Roboto'
          }
        }
      ]
    },
    legend: {
      onHover(e) {
        (e.target as any).style.cursor = 'pointer';
      }
    },
    hover: {
      onHover(e) {
        const point = this.getElementAtEvent(e);
        if (point.length) {
          (e.target as any).style.cursor = 'pointer';
        } else {
          (e.target as any).style.cursor = 'default';
        }
      }
    }
  };
  barChartLabels: Label[] = [];
  barChartData: ChartDataSets[];
  private ngUnsubscribe = new Subject();

  constructor(
    private dialog: MatDialog,
    private afs: AngularFirestore,
    private snack: MatSnackBar,
    @Inject(LOCALE_ID) protected locale: string
  ) {}

  ngOnInit() {
    this.startDate$
      .pipe(
        tap(() => {
          this.barChartData[0].data = [];
          this.barChartData[1].data = [];
        }),
        debounceTime(500),
        switchMap(data =>
          combineLatest(
            this.afs
              .collection<Payment>('payments', ref =>
                ref
                  .where('date', '>=', firestore.Timestamp.fromDate(data.start))
                  .where('date', '<=', firestore.Timestamp.fromDate(data.end))
              )
              .valueChanges()
              .pipe(
                map(ps => {
                  const arr: number[] = new Array(this.monthToShow).fill(0);
                  ps.forEach(
                    item =>
                      ((arr[
                        this.barChartLabels.indexOf(
                          this.getMonth(item.date.toDate())
                        )
                      ] as number) += item.price)
                  );
                  return arr;
                })
              ),
            this.afs
              .collection<Charge>('charges', ref =>
                ref
                  .where('date', '>=', firestore.Timestamp.fromDate(data.start))
                  .where('date', '<=', firestore.Timestamp.fromDate(data.end))
              )
              .valueChanges()
              .pipe(
                map(ps => {
                  const arr: number[] = new Array(this.monthToShow).fill(0);
                  ps.forEach(
                    item =>
                      ((arr[
                        this.barChartLabels.indexOf(
                          this.getMonth(item.date.toDate())
                        )
                      ] as number) += item.cost)
                  );
                  return arr;
                })
              )
          )
        ),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        data => {
          this.barChartData[0].data = data[0];
          this.barChartData[1].data = data[1];
        },
        () =>
          this.snack.open(
            this.i18n.nativeElement.childNodes[2].textContent,
            'X',
            { duration: 3000 }
          )
      );
    this.curentStartDate.setHours(0, 0, 0);
    this.curentEndDate.setMonth(this.curentEndDate.getMonth() + 1, 0);
    this.curentEndDate.setHours(23, 59, 59);
    this.initLabels();
    this.startDate$.next({
      start: this.curentStartDate,
      end: this.curentEndDate
    });
  }

  initLabels() {
    for (let i = 0; i < this.monthToShow; i++) {
      this.barChartLabels.unshift(this.getMonth(this.curentStartDate));
      if (i === this.monthToShow - 1) {
        continue;
      }
      this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 1, 1);
    }
    this.barChartData = [
      {
        data: [],
        label: this.i18n.nativeElement.childNodes[0].textContent,
        backgroundColor: '#4CAF50',
        hoverBackgroundColor: '#388E3C',
        borderColor: '#9E9E9E'
      },
      {
        data: [],
        label: this.i18n.nativeElement.childNodes[1].textContent,
        backgroundColor: '#FF5252',
        hoverBackgroundColor: '#D32F2F',
        borderColor: '#9E9E9E'
      }
    ];
  }

  onNext() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() + 1);
    this.curentEndDate.setMonth(this.curentEndDate.getMonth() + 2, 0);
    this.startDate$.next({
      start: this.curentStartDate,
      end: this.curentEndDate
    });
    this.barChartLabels.shift();
    this.barChartLabels.push(this.getMonth(this.curentEndDate));
  }

  onPrevious() {
    this.curentStartDate.setMonth(this.curentStartDate.getMonth() - 1);
    this.curentEndDate.setDate(0);
    this.startDate$.next({
      start: this.curentStartDate,
      end: this.curentEndDate
    });
    this.barChartLabels.pop();
    this.barChartLabels.unshift(this.getMonth(this.curentStartDate));
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

  getMonth(date: Date): string {
    return date.toLocaleString(this.locale, {
      month: 'short',
      year: 'numeric'
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
