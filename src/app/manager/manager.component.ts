import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {

  constructor(private sidenavService: SidenavService) { }

  ngOnInit() {
    this.sidenavService.close();
  }

}
