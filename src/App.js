import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, entries } from 'mobx';

import CombinationChart from './charts/combination/CombinationChart';
import AreaChart from './charts/combination/AreaChart';
import BarChart from './charts/combination/BarChart';
import BandAxis from './charts/combination/BandAxis';
import ValueAxis from './charts/combination/ValueAxis';
import StackedBarChart from './charts/combination/StackedBarChart';

import BandStateMachineAxis from './BandStateMachineAxis';

import CombinationChartManager
  from './charts/combination/CombinationChartManager';
import BlocklyContainer from './BlocklyContainer';

class App extends Component {
  render() {
    return (
      <div style={containerStyle}>
        <BlocklyContainer measures={MEASURES} />
        <div style={{ flex: 1 }}>
          <div style={this.controlsStyle}>
            <button onClick={resetData} style={{ marginLeft: 20 }}>
              Reset data
            </button>
          </div>
          <div style={chartContainerStyle}>
            {this.renderCharts()}
          </div>
        </div>
      </div>
    );
  }

  renderCharts() {
    const charts = [];
    for (const [chartId, chart] of entries(CombinationChartManager.charts)) {
      if (chart.axises.length > 0 || chart.charts.length > 0) {
        chart.store.setData(data);
        chart.store.setOrientation(chart.orientation);
        chart.store.setBandScalePadding(chart.bandScalePadding);
        charts.push((
          <CombinationChart
            key={chartId}
            store={chart.store}
            style={this.chartStyle}
            chartStyle={this.chartChartStyle}
          >
            {chart.axises.map(buildAxisFromConfig)}
            {chart.charts.map(buildChartFromConfig)}
          </CombinationChart>
        ));
      }
    }
    return charts;
  }

  get controlsStyle() {
    return {
      padding: 5,
    };
  }

  get chartStyle() {
    return {
      width: 800,
      height: 600,
      display: 'inline-block',
    };
  }

  get chartChartStyle() {
    return {
      margin: {
        left: 100,
        right: 100,
      },
    };
  }
}

observer(App);
export default App;

const containerStyle = {
  width: '100%',
  color: '#333',
  display: 'flex',
  flexDirection: 'column',
};

const chartContainerStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
};

const buildAxisFromConfig = (axis, index) => {
  const cfg = { key: `axis-${index}`, ...axis };
  switch (axis.type) {
    case 'value':
      return <ValueAxis {...cfg} />;
    case 'band':
      return <BandAxis {...cfg} />;
    case 'band_state_machine':
      return <BandStateMachineAxis {...cfg} />;
  }
  return null;
};

const buildChartFromConfig = ({ type, config }, index) => {
  switch (type) {
    case 'bar':
      return <BarChart
        key={`chart-${index}`}
        measure={config.measure}
        color={config.color}
      />;
    case 'area':
      return <AreaChart
        key={`chart-${index}`}
        measure={config.measure}
        color={config.color}
      />;
    case 'stackedbar':
      return <StackedBarChart
        key={`chart-${index}`}
        measures={config.measures}
      />;
  }
  return null;
};

const data = observable([]);
const MEASURES = ['Other', 'Blocked Holds', 'Non-blocked Holds'];

const resetData = () => {
  const bands = ['Draft', 'Awaiting', 'Tendered', 'Confirmed', 'Pick Ready', 'In Transit',
    'Arrived', 'Delivery Ready', 'Delivered'].reverse();
  
  const rndVal = () => Math.random() > 0.05
    ? Math.round(Math.random() * 100)
    : undefined;

  data.length = 0;
  bands.forEach(band => {
    const measures = MEASURES.reduce((measureValues, measure) => {
      measureValues[measure] = rndVal();
      return measureValues;
    }, {});
    
    data.push([band, measures]);
  });
};

resetData();
