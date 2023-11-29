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
import exportFromJSON from 'export-from-json';
import * as d3 from 'd3';
//import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  @Input() idExercise: any;
  @Input() reportType: any;
  title = 'D3 Barchart with Ionic 4';
  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any;
  y: any;
  svg: any;
  g: any;

  private subs = new SubSink();
  authInfoStore = new Auth();
  historyInfoStore = new HistoryInfo();
  auxHistory = new History();
  constructor(
    public authService: AuthService,
    public historyService: HistoryService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    public alertController: AlertController
  ) {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadData(`sum`);
  }

  private initializeSubscriptions(): void {
    this.subs.add(
      this.authService.authInfoListener().subscribe((data) => {
        this.authInfoStore.update(data);
      }),

      this.historyService.setPropertyListener().subscribe((historyData) => {
        this.historyInfoStore.update(historyData);
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawBars();
      })
    );
  }
  ionViewWillEnter() {
    if (!this.authService.authInfo.isLoggedIn) {
      this.authService.redirectOnUnauthorized();
    } else {
      this.loadData(this.reportType);
    }
  }

  loadData(report: string): void {
    this.reportType = report;
    this.authInfoStore.update(this.authService.authInfo);
    this.historyService.getHistoriesMonth(this.idExercise, this.reportType);
  }

  initSvg() {
    if (this.svg !== undefined) {
      this.svg.remove();
    }
    this.svg = d3
      .select('#my_dataviz')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 800 400');
    this.g = this.svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
  }

  initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.historyInfoStore.historyMonthsQty.map((d) => d.month));
    this.y.domain([
      0,
      d3Array.max(this.historyInfoStore.historyMonthsQty, (d: any) => d.qty),
    ]);
  }

  drawAxis() {
    this.g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .transition()
      .call(d3Axis.axisBottom(this.x));
    this.g
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y));

    if (this.reportType === 'sum') {
      this.g
        .append('text')
        .attr('class', 'y label')
        .text('Acréscimo de carga [Kg]')
        .attr(
          'transform',
          `translate(${[
            -(this.margin.left / 2 + 15),
            this.height / 2,
          ]}) rotate(90)`
        );
    }
    if (this.reportType === 'qty') {
      this.g
        .append('text')
        .attr('class', 'y label')
        .text('Frequência')
        .attr(
          'transform',
          `translate(${[
            -(this.margin.left / 2 + 15),
            this.height / 2,
          ]}) rotate(90)`
        );
    }
    if (this.reportType === 'min') {
      this.g
        .append('text')
        .attr('class', 'y label')
        .text('Menor carga [Kg]')
        .attr(
          'transform',
          `translate(${[
            -(this.margin.left / 2 + 15),
            this.height / 2,
          ]}) rotate(90)`
        );
    }
    if (this.reportType === 'max') {
      this.g
        .append('text')
        .attr('class', 'y label')
        .text('Maior carga [Kg]')
        .attr(
          'transform',
          `translate(${[
            -(this.margin.left / 2 + 15),
            this.height / 2,
          ]}) rotate(90)`
        );
    }
    if (this.reportType === 'mean') {
      this.g
        .append('text')
        .attr('class', 'y label')
        .text('Carga média [Kg]')
        .attr(
          'transform',
          `translate(${[
            -(this.margin.left / 2 + 15),
            this.height / 2,
          ]}) rotate(90)`
        );
    }
    this.g
      .append('text')
      .attr('class', 'x label')
      .text('Mês')
      .attr(
        'transform',
        `translate(${[
          this.width / 2,
          this.height + 10 + this.margin.bottom / 2,
        ]})`
      );
  }

  drawBars() {
    this.g
      .selectAll('.bar')
      .data(this.historyInfoStore.historyMonthsQty)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => this.x(d.month))
      .attr('y', (d: any) => this.y(d.qty))
      .attr('width', this.x.bandwidth())
      .attr('height', (d: any) => this.height - this.y(d.qty))
      .style('fill', '#ef8535');
    this.g
      .selectAll('.bar-label')
      .data(this.historyInfoStore.historyMonthsQty)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      // Position the text label appropriately
      .attr('x', (d: any) => this.x(d.month) + this.x.bandwidth() / 2)
      .attr('y', (d: any) => this.y(d.qty) - 2)
      .attr('text-anchor', 'middle') // To center the text on the bar
      .text((d: any) => d.qty.toString()); // Assuming each data point has a 'label' property
  }

  export() {
    //const data = [{ foo: "foo" }, { bar: "bar" }];
    let auxData: any[] = [];
    this.historyInfoStore.historyMonthsQty.forEach((element) => {
      auxData.push({
        Valor: element.qty,
        Mes: element.month,
        Ano: element.year,
      });
    });
    const data = auxData;
    const fileName = 'relatorioPerformance';
    const exportType = 'xls';
    exportFromJSON({ data, fileName, exportType });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
