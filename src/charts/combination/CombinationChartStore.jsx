import { decorate, observable, computed, action } from 'mobx';
import * as d3 from 'd3';

class CombinationChartStore {
  constructor(props) {
    Object.assign(this, props);
    this.orientation = this.orientation || 'vertical';

    this.charts = new Map();
  }

  /**
   * @param {Array} data 
   */
  setData(data) {
    this.data = data;
  }

  setSvg(svg) {
    this.svg = svg;
  }

  setOrientation(orientation) {
    this.orientation = orientation;
  }

  /**
   * Registers a chart and returns auto-generated ID assigned to it.
   * This ID can be used to remove that chart afterwards.
   * @param {*} chart 
   */
  addChart(chart) {
    const chartId = chartIdGenerator();
    this.charts.set(chartId, chart);
    return chartId;
  }

  /**
   * Removes the chart from the registered charts collection.
   * @param {*} chartId 
   */
  removeChart(chartId) {
    this.charts.delete(chartId);
  }

  get width() {
    return this.svg ? Number(this.svg.attr('inner-width')) : 0;
  }

  get height() {
    return this.svg ? Number(this.svg.attr('inner-height')) : 0;
  }

  get valueScale() {
    const start = this.isVertical ? this.height : 0;
    const end = this.isVertical ? 0 : this.width;
    return d3.scaleLinear()
      .range([start, end])
      .domain([d3.min(this.chartValues), d3.max(this.chartValues)])
      .nice();
  }

  get bandScale() {
    const start = this.isVertical ? 0 : this.height;
    const end = this.isVertical ? this.width : 0;
    return d3.scaleBand()
      .range([start, end])
      .domain(this.data.map(d => d[0]))
      .padding(0.1);
  }

  get chartValues() {
    const values = [0];
    for (const chart of this.charts.values()) {
      chart.getValues(this.data).forEach(v => values.push(v));
    }
    return values;
  }

  get isVertical() {
    return this.orientation === 'vertical';
  }
}

decorate(CombinationChartStore, {
  data: observable,
  charts: observable,
  svg: observable,
  orientation: observable,
  
  valueScale: computed,
  bandScale: computed,
  chartValues: computed,
  width: computed,
  height: computed,
  isVertical: computed,
  
  setData: action,
  addChart: action,
  removeChart: action,
  setSvg: action,
  setOrientation: action,
});
export default CombinationChartStore;

let chartIdSeq = 0;
const chartIdGenerator = () => `chart-${chartIdSeq++}`;