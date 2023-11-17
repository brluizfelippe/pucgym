import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.page.html',
  styleUrls: ['./cancel.page.scss'],
})
export class CancelPage implements OnInit {
  logoUrl = 'assets/img/Logo.png';
  constructor() {}
  onExit() {
    window.close();
  }

  ngOnInit() {}
}
