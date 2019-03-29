import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private sidenavService: SidenavService) { }

  ngOnInit() {
    this.sidenavService.close();
  }

}
