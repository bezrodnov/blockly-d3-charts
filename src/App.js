import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, entries } from 'mobx';

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
const data = observable([]);

const MEASURES = ['actual', 'previous', 'projected'];

const resetData = () => {
  const persons = ['Bob', 'Robin', 'Anne', 'Mark', 'Joe', 'Eve', 'Karen',
    'Kirsty', 'Chris', 'Lisa', 'Tom', 'Stacy', 'Charles', 'Mary'];
  
  const rndVal = () => Math.random() > 0.05
    ? Math.round(Math.random() * 125 - 25)
    : undefined;

  data.length = 0;
  persons.forEach(person => {
    const measures = MEASURES.reduce((measureValues, measure) => {
      measureValues[measure] = rndVal();
      return measureValues;
    }, {});
    
    data.push([person, measures]);
  });
};

resetData();

class App extends Component {
  componentDidMount() {
    this.workspace = Blockly.inject('blocklyDiv', {
      toolbox: document.getElementById('toolbox'),
    });

    this.workspace.getMeasureDropdown = () =>
      new Blockly.FieldDropdown(() => MEASURES.map(m => [m, m]));

    this.workspace.addChangeListener(e => {
      const code = Blockly.JavaScript.workspaceToCode(this.workspace);
      try {
        eval(code);
      } catch (err) {
        console.error(err);
      }
    });
  }

  render() {
    return (
      <div style={containerStyle}>
        <div id="blocklyDiv" style={{ height: 400 }}/>
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

    for (const [chartId, chart] of entries(CombinationChartManager.charts)) {
      if (chart.axises.length > 0 || chart.charts.length > 0) {
        chart.store.setData(data);
        chart.store.setOrientation(chart.orientation);
        charts.push((
          <CombinationChart
            key={chartId}
            store={chart.store}
            style={this.chartStyle}
          >
            {chart.axises.map((axis, index) => {
              const cfg = {
                key: `axis-${index}`,
                horizontalPosition: axis.hPos,
                verticalPosition: axis.vPos,
              };
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

  get controlsStyle() {
    return {
      padding: 20,
    };
  }

  get chartStyle() {
    return {
      width: 600,
      height: 400,
    };
  }
}

observer(App);
export default App;

const containerStyle = {
  width: '100%',
  background: '#EEE',
  color: '#333',
  display: 'flex',
  flexDirection: 'column',
};

const chartContainerStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
};