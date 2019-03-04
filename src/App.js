import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, entries } from 'mobx';
import { applyDecorators, autobind } from 'core-decorators';

import CombinationChart from './charts/combination/CombinationChart';
import AreaChart from './charts/combination/AreaChart';
import BarChart from './charts/combination/BarChart';
import BandAxis from './charts/combination/BandAxis';
import ValueAxis from './charts/combination/ValueAxis';
import StackedBarChart from './charts/combination/StackedBarChart';

import './blocks/Blocks';
import CombinationChartManager
  from './charts/combination/CombinationChartManager';

const { Blockly } = window;
Blockly.FieldColour.COLOURS.push('rgba(0,0,0,0)');

class App extends Component {
  constructor() {
    super(...arguments);

    this.state = { collapsed: false };
  }

  componentDidMount() {
    this.workspace = Blockly.inject('blocklyDiv', {
      toolbox: document.getElementById('toolbox'),
      trashcan: true,
      scrollbars: true,
    });

    this.workspace.getMeasureDropdown = () =>
      new Blockly.FieldDropdown(() => MEASURES.map(m => [m, m]));

    this.workspace.addChangeListener(e => {
      const code = Blockly.JavaScript.workspaceToCode(this.workspace);
      try {
        eval(code);
      } catch (err) {
        console.log(code);
        console.error(err);
      }
    });

    addDemoBlocks(this.workspace);

    if (window.localStorage && window.localStorage.getItem('react-charts-default-collapsed') !== 'false') {
      setTimeout(() => {
        this.setState({ collapsed: true });
      }, 1000);
    }
  }

  render() {
    const collapser = <div
      style={this.collapserStyle}
      onClick={this.onCollapserClick}
      role="button"
      tabIndex="-1"
      title="Click to collapse/expand"
    />;
    return (
      <div style={containerStyle}>
        <div id="blocklyDiv" style={this.blocklyWorkspaceStyle}/>
        {collapser}
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
            {chart.axises.map((axis, index) => {
              const cfg = { key: `axis-${index}`, ...axis };
              return axis.type === 'value'
                ? <ValueAxis {...cfg} />
                : <BandAxis {...cfg} />;
            })}
            {chart.charts.map(buildChartFromConfig)}
          </CombinationChart>
        ));
      }
    }
    return charts;
  }

  onCollapserClick() {
    if (window.localStorage) {
      window.localStorage.setItem('react-charts-default-collapsed', !this.isCollapsed);
    }
    this.setState({ collapsed: !this.isCollapsed });
  }

  get isCollapsed() {
    return this.state && this.state.collapsed;
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

  get blocklyWorkspaceStyle() {
    const height = this.isCollapsed ? 0 : 400;
    return {
      height,
      transition: 'height 0.3s ease-in',
    };
  }

  get collapserStyle() {
    return {
      height: 15,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.65) 100%)',
      borderRadius: 5,
      cursor: 'pointer',
      outline: 'none',
    };
  }
}

observer(App);
applyDecorators(App, {
  onCollapserClick: [autobind],
});
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

const addDemoBlocks = workspace => {
  const chart = workspace.newBlock('combination_chart');
  chart.setFieldValue('horizontal', 'ORIENTATION');
  chart.setFieldValue(0.7, 'BAND_SCALE_PADDING');
  chart.initSvg();
  chart.render();

  const valueAxis = workspace.newBlock('value_axis');
  valueAxis.setFieldValue('rgba(0,0,0,0)', 'TICK_COLOR');
  chart.nextConnection.connect(valueAxis.previousConnection);
  valueAxis.initSvg();
  valueAxis.render();

  const bandAxis = workspace.newBlock('band_axis');
  bandAxis.setFieldValue('rgba(0,0,0,0)', 'TICK_COLOR');
  valueAxis.nextConnection.connect(bandAxis.previousConnection);
  bandAxis.initSvg();
  bandAxis.render();

  const stackedBarChart = workspace.newBlock('stacked_bar_chart');
  bandAxis.nextConnection.connect(stackedBarChart.previousConnection);
  stackedBarChart.initSvg();
  stackedBarChart.render();
  
  const COLORS = ['#B3E5FC', '#03A9F4', '#CC0000'];
  let previousConnection = stackedBarChart.getFirstStatementConnection();
  MEASURES.forEach((m, index) => {
    const measure = workspace.newBlock('measure_settings');
    measure.setFieldValue(m, 'MEASURE');
    measure.setFieldValue(COLORS[index], 'COLOR');
    previousConnection.connect(measure.previousConnection);
    previousConnection = measure.nextConnection;
    measure.initSvg();
    measure.render();
  });
};