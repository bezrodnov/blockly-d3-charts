import { decorate, observable, computed, action, set, get } from 'mobx';
import * as d3 from 'd3';

class CombinationChartStore {
  constructor(props) {
    Object.assign(this, props);
    this.orientation = this.orientation || 'vertical';
    this.bandScalePadding = this.bandScalePadding || 0.5;

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

  setBandScalePadding(bandScalePadding) {
    this.bandScalePadding = bandScalePadding;
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

  setChartMinMaxValue(chartId, minValue, maxValue) {
    set(this.charts.get(chartId), { minValue, maxValue });
  }

  getChartSize(chartId) {
    if (!this.charts.get(chartId).requiresSpace) {
      return this.bandScale.bandwidth();
    }
    // calculate available size for each chart
    let chartsRequiringSpace = 0;
    this.charts.forEach(chart => {
      if (chart.requiresSpace) {
        chartsRequiringSpace++;
      }
    });
    return this.bandScale.bandwidth() / chartsRequiringSpace;
  }

  getChartOffset(chartId) {
    if (!this.charts.get(chartId).requiresSpace) {
      return 0;
    }
    const size = this.getChartSize(chartId);
    let offset = 0;
    
    for (const id of this.charts.keys()) {
      if (id !== chartId) {
        if (this.charts.get(id).requiresSpace) {
          offset += size;
        }
      } else {
        break;
      }
    }
    return offset;
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
      .domain([this.minValue, this.maxValue])
      .nice();
  }

  get bandScale() {
    const start = 0;
    const end = this.isVertical ? this.width : this.height;
    return d3.scaleBand()
      .range([start, end])
      .domain(this.data.map(d => d[0]))
      .padding(this.bandScalePadding);
  }

  get minValue() {
    let minValue = 0;
    for (const chart of this.charts.values()) {
      const value = get(chart, 'minValue');
      if (value < minValue) {
        minValue = value;
      }
    }
    return minValue;
  }
  
  get maxValue() {
    let maxValue = 0;
    for (const chart of this.charts.values()) {
      const value = get(chart, 'maxValue');
      if (value > maxValue) {
        maxValue = value;
      }
    }
    return maxValue || 100;
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
  bandScalePadding: observable,
  
  valueScale: computed,
  bandScale: computed,
  width: computed,
  height: computed,
  isVertical: computed,
  minValue: computed,
  maxValue: computed,
  
  setData: action,
  setSvg: action,
  addChart: action,
  removeChart: action,
  setChartMinMaxValue: action,
  setOrientation: action,
  setBandScalePadding: action,
});
export default CombinationChartStore;

let chartIdSeq = 0;
const chartIdGenerator = () => `chart-${chartIdSeq++}`;