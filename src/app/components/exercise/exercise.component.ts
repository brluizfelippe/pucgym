import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

export const StatsPieChart: any[] = [
  { party: 'BJP', electionP: 56 },
  { party: 'INC', electionP: 18 },
  { party: 'AA', electionP: 10 },
  { party: 'CPI', electionP: 5 },
  { party: 'CPI-M', electionP: 5 },
  { party: 'BSP', electionP: 7 },
  { party: 'AITS', electionP: 10 },
];

export interface Employee {
  company: string;
  frequency: number;
}

export const StatsBarChart: Employee[] = [
  { company: 'Apple', frequency: 100000 },
  { company: 'IBM', frequency: 80000 },
  { company: 'HP', frequency: 20000 },
  { company: 'Facebook', frequency: 70000 },
  { company: 'TCS', frequency: 12000 },
  { company: 'Google', frequency: 110000 },
  { company: 'Wipro', frequency: 5000 },
  { company: 'EMC', frequency: 4000 },
];

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit {
  title = 'D3 Barchart with Ionic 4';
  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any;
  y: any;
  svg: any;
  g: any;

  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawBars();
  }

  initSvg() {
    this.svg = d3
      .select('#barChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 900 500');
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
    this.x.domain(StatsBarChart.map((d) => d.company));
    this.y.domain([0, d3Array.max(StatsBarChart, (d: any) => d.frequency)]);
  }

  drawAxis() {
    this.g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    this.g
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');
  }

  drawBars() {
    this.g
      .selectAll('.bar')
      .data(StatsBarChart)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => this.x(d.company))
      .attr('y', (d: any) => this.y(d.frequency))
      .attr('width', this.x.bandwidth())
      .attr('height', (d: any) => this.height - this.y(d.frequency));
  }
}
