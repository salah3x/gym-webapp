import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.css']
})
export class SuperAdminComponent implements OnInit {

  constructor(private sidenavService: SidenavService) { }

  ngOnInit() {
    this.sidenavService.close();
  }

}
