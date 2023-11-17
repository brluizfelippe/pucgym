import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  authInfoStore = new Auth();
  paymentInfoStore: any;
  showStripe!: boolean;
  itemSelected!: boolean;
  serviceSelected: any;
  private authSub = new Subscription();
  private paymentSub = new Subscription();

  public form = [
    { name: 'stúdio com personal', val: '350', isChecked: false },
    { name: 'stúdio sem personal', val: '250', isChecked: false },
    { name: 'academia 3 vezes/semana', val: '150', isChecked: false },
    { name: 'academia ilimitado', val: '200', isChecked: false },
  ];

  constructor(
    public authService: AuthService,
    public paymentService: PaymentService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet
  ) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    this.itemSelected = false;

    this.authSub = this.authService.authInfoListener().subscribe((data) => {
      this.authInfoStore.update(data);
    });
    this.authInfoStore.update(this.authService.authInfo);
    this.paymentSub = this.paymentService
      .setPropertyListener()
      .subscribe((data) => {
        this.paymentInfoStore = data;
        window.open(this.paymentInfoStore.url); // Open new tab
        //window.location = this.paymentInfoStore.url;
      });
  }

  ionViewWillEnter() {
    this.authService.authInfo.isLoggedIn
      ? this.authInfoStore.update(this.authService.authInfo)
      : this.authService.redirectOnUnauthorized();
  }

  onChecked(checkBox: any, entryIndex: number) {
    this.form.forEach((el, index) => {
      index === entryIndex
        ? (el.isChecked = checkBox.detail.checked)
        : (el.isChecked = false);
    });

    this.itemSelected = true;
    this.serviceSelected = entryIndex;
  }

  checkout() {
    this.paymentService.onCheckout(this.serviceSelected);
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
