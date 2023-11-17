import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {
  logoUrl = 'assets/img/Logo.png';
  constructor() {}
  onExit() {
    window.close();
  }

  ngOnInit() {}
}
