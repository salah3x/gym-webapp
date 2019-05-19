import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  next = 2;
  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit() {
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundImage = 'url("/assets/background1.jpg';
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundPosition = 'center';
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundSize = 'cover';
    (this.renderer.selectRootElement('.toolbar', true) as HTMLElement)
      .style.background = '#00000090';
    this.changeBackground();
  }

  changeBackground() {
    setTimeout(() => {
      if (this.next === 6) {
        this.next = 1;
      }
      (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundImage = `url("/assets/background${this.next++}.jpg")`;
      this.changeBackground();
    }, 10000);
  }

  ngOnDestroy() {
    (this.renderer.selectRootElement('mat-sidenav-content', true) as HTMLElement)
      .style.backgroundImage = '';
    (this.renderer.selectRootElement('.toolbar', true) as HTMLElement)
      .style.background = '#3f51b5';
  }
}
