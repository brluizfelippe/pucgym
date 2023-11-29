import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Input,
  HostListener,
} from '@angular/core';
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
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

@Component({
  selector: 'app-history-by-month',
  templateUrl: './history-by-month.component.html',
  styleUrls: ['./history-by-month.component.scss'],
})
export class HistoryByMonthComponent implements OnInit {
  @ViewChild('chart', { static: true })
  private chartContainer!: ElementRef;
  @Input() idExercise: any;
  @Input() reportType: any;
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
    am4core.useTheme(am4themes_animated);
    this.chart = am4core.create(this.reportType, am4charts.XYChart);

    this.chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    // Add data
    if (this.reportType === 'sum') {
      this.chart.data = this.historyInfoStore.historyMonthsDif.map((obj) => ({
        month: obj.month,
        qty: obj.qty,
      }));
    } else
      this.chart.data = this.historyInfoStore.historyMonthsQty.map((obj) => ({
        month: obj.month,
        qty: obj.qty,
      }));

    let categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = 'month';
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.fontSize = 11;

    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 50;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.minGridDistance = 30;
    // axis break
    let axisBreak = valueAxis.axisBreaks.create();
    axisBreak.startValue = 10;
    axisBreak.endValue = 20;
    //axisBreak.breakSize = 0.005;

    // fixed axis break
    let d =
      (axisBreak.endValue - axisBreak.startValue) /
      (valueAxis.max - valueAxis.min);
    axisBreak.breakSize = (0.05 * (1 - d)) / d; // 0.05 means that the break will take 5% of the total value axis height

    // make break expand on hover
    let hoverState = axisBreak.states.create('hover');
    hoverState.properties.breakSize = 1;
    hoverState.properties.opacity = 0.1;
    hoverState.transitionDuration = 1500;

    axisBreak.defaultState.transitionDuration = 1000;
    /*
    // this is exactly the same, but with events
    axisBreak.events.on("over", function() {
      axisBreak.animate(
        [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
        1500,
        am4core.ease.sinOut
      );
    });
    axisBreak.events.on("out", function() {
      axisBreak.animate(
        [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
        1000,
        am4core.ease.quadOut
      );
    });*/

    let series = this.chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = 'month';
    series.dataFields.valueY = 'qty';
    series.columns.template.tooltipText = '{valueY.value}';
    series.columns.template.tooltipY = 0;
    series.columns.template.strokeOpacity = 0;
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
    this.historyService.getHistoriesMonth(this.idExercise, this.reportType);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
