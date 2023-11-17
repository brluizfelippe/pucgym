import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Auth } from 'src/app/classes/auth';
import { History } from 'src/app/classes/history';
import { HistoryInfo } from 'src/app/classes/history-info';
import { AuthService } from 'src/app/services/auth.service';
import { HistoryService } from 'src/app/services/history.service';
import { SubSink } from 'subsink';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  @ViewChild('chart', { static: true })
  private chartContainer!: ElementRef;
  @Input() idExercise: any;
  private chart: am4charts.XYChart | undefined;
  authInfoStore = new Auth();
  historyInfoStore = new HistoryInfo();
  auxHistory = new History();
  private subs = new SubSink();

  constructor(
    public authService: AuthService,
    public historyService: HistoryService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
    this.loadData();
  }

  buildChart() {
    // Create chart instance
    this.chart = am4core.create('chartdiv', am4charts.XYChart);

    // Add data
    this.chart.data = this.historyInfoStore.histories.map((obj) => ({
      date: obj.date,
      value: obj.value,
    }));

    // Create axes
    let dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    let series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'date';
    series.tooltipText = '{value} Kg';
    series.strokeWidth = 2;
    series.minBulletDistance = 15;

    // Make bullets grow on hover
    let bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.strokeWidth = 2;
    bullet.circle.radius = 4;
    bullet.circle.fill = am4core.color('#fff');

    let bullethover = bullet.states.create('hover');
    bullethover.properties.scale = 1.3;

    // Add cursor
    this.chart.cursor = new am4charts.XYCursor();
    // Add scrollbar
    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(series);
    this.chart.scrollbarX = scrollbarX;
  }

  private initializeSubscriptions(): void {
    this.subs.add(
      this.authService.authInfoListener().subscribe((data) => {
        this.authInfoStore.update(data);
      }),

      this.historyService.setPropertyListener().subscribe((historyData) => {
        this.historyInfoStore.update(historyData);
        this.buildChart();
      })
    );
  }
  ionViewWillEnter() {
    if (!this.authService.authInfo.isLoggedIn) {
      this.authService.redirectOnUnauthorized();
    } else {
      this.loadData();
    }
  }

  private loadData(): void {
    this.authInfoStore.update(this.authService.authInfo);
    this.historyService.getHistories(this.idExercise);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
