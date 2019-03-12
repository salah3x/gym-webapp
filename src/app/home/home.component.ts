import { Component, OnInit, OnDestroy, ViewEncapsulation, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit() {
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundImage = 'url("http://www.howleysbutchers.ie/wp-content/uploads/2016/03/empty-gym.jpg")';
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundPosition = 'center';
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundSize = 'cover';
    (this.renderer.selectRootElement('.mat-toolbar.mat-primary', true) as HTMLElement)
    .style.background = '#00000090';
  }

  ngOnDestroy() {
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundImage = '';
    (this.renderer.selectRootElement('.mat-toolbar.mat-primary', true) as HTMLElement)
      .style.background = '#3f51b5';
  }
}
