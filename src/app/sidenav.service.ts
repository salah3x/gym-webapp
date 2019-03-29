import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  private sideNav: MatSidenav;

  constructor() { }

  setSideNav(s: MatSidenav) {
    this.sideNav = s;
  }

  // Call this function to close the sidenav after navigation (in ngOnInit)
  close() {
    this.sideNav.close();
  }
}
