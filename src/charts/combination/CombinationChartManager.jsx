import { decorate, observable, action, set } from 'mobx';
import CombinationChartStore from './CombinationChartStore';

class CombinationChartManager {
  constructor() {
    this.charts = {};
  }

  setChart(chartId, chart) {
    if (chart) {
      chart.store = this.charts[chartId]
        ? this.charts[chartId].store
        : new CombinationChartStore();
    }
    set(this.charts, chartId, chart);
  }

  getChartBuilder(chartId) {
    return new ChartBuilder(chart => {
      this.setChart(chartId, chart);
    });
  }
}
decorate(CombinationChartManager, {
  charts: observable,
  setChart: action,
});

class ChartBuilder {
  constructor(cb) {
    this.onFinish = cb;
    this.chart = {
      axises: [],
      charts: [],
    };
  }

  addChart(type, config) {
    this.chart.charts.push({ type, config });
    return this;
  }

  addAxis(axis) {
    this.chart.axises.push(axis);
    return this;
  }

  setOrientation(orientation) {
    this.chart.orientation = orientation;
    return this;
  }

  setBandScalePadding(bandScalePadding) {
    this.chart.bandScalePadding = bandScalePadding;
    return this;
  }

  build() {
    this.onFinish(this.chart);
  }
}

window.CombinationChartManager = new CombinationChartManager();
export default window.CombinationChartManager;