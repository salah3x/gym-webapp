import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ChargeAddComponent } from './charge-add/charge-add.component';

@Component({
  selector: 'app-charges-payments',
  templateUrl: './charges-payments.component.html',
  styleUrls: ['./charges-payments.component.css']
})
export class ChargesPaymentsComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  openNewChargeDialog() {
    this.dialog.open(ChargeAddComponent, {
      width: '400px'
    });
  }
}
