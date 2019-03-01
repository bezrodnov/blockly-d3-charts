import React, { Component } from 'react';
import { observer } from 'mobx-react';

import CombinationChart from './charts/combination/CombinationChart';
import CombinationChartStore from './charts/combination/CombinationChartStore';
import AreaChart from './charts/combination/AreaChart';
import BarChart from './charts/combination/BarChart';
import BandAxis from './charts/combination/BandAxis';
import ValueAxis from './charts/combination/ValueAxis';
import StackedBarChart from './charts/combination/StackedBarChart';

const store = new CombinationChartStore({ data: [] });

const resetData = () => {
  const persons = ['Bob', 'Robin', 'Anne', 'Mark', 'Joe', 'Eve', 'Karen',
    'Kirsty', 'Chris', 'Lisa', 'Tom', 'Stacy', 'Charles', 'Mary'];
  
  const rndVal = () => Math.random() > 0.05
    ? Math.round(Math.random() * 100 + 30)
    : undefined;

  store.setData(persons.map(person => {
    const actual = rndVal();
    const projected = rndVal();
    const previous = rndVal();
    return [person, { actual, projected, previous }];
  }));
};

resetData();

class App extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      axisXPosition: 'bottom',
      axisYPosition: 'left',
    };

    this.onAxisXPositionChange = this.onAxisXPositionChange.bind(this);
    this.onAxisYPositionChange = this.onAxisYPositionChange.bind(this);
  }

  render() {
    const { axisXPosition, axisYPosition } = this.state;
    const { orientation } = store;
    return (
      <div style={containerStyle}>
        <div style={this.controlsStyle}>
          <span>X Axis Position </span>
          <select value={axisXPosition} onChange={this.onAxisXPositionChange}>
            <option value="top">Top</option>
            <option value="zero">Zero</option>
            <option value="bottom">Bottom</option>
          </select>
          <span style={{ marginLeft: 20 }}>Y Axis Position </span>
          <select value={axisYPosition} onChange={this.onAxisYPositionChange}>
            <option value="left">Left</option>
            <option value="zero">Zero</option>
            <option value="right">Right</option>
          </select>
          <button onClick={resetData} style={{ marginLeft: 20 }}>Reset data</button>
          <button onClick={toggleOrientation} style={{ marginLeft: 20 }}>Toggle Orientation</button>
        </div>
        <div style={chartContainerStyle}>
          <CombinationChart style={this.getChartStyle()} store={store} orientation={orientation}>
            <BandAxis verticalPosition={axisXPosition} horizontalPosition={axisYPosition} />
            <ValueAxis verticalPosition={axisXPosition} horizontalPosition={axisYPosition} />
            
            <BarChart measure="previous" color="#55C" />
            <StackedBarChart measures={[
              {name: 'actual', color: '#5C5'}, {name: 'projected', color: '#C55'},
            ]}/>
            <AreaChart measure="actual" color="#73F" /> */}
          </CombinationChart>
        </div>
      </div>
    );
  }

  onAxisXPositionChange({ target: select }) {
    this.setState({ axisXPosition: select.value });
  }

  onAxisYPositionChange({ target: select }) {
    this.setState({ axisYPosition: select.value });
  }

  getChartStyle() {
    const { orientation } = this.state;
    return {
      width: orientation === 'horizontal' ? 400 : 700,
      paddingRight: orientation === 'horizontal' ? 300 : 0,
      height: orientation === 'horizontal' ? 700 : 400,
      marginRight: 50,
    };
  }

  get controlsStyle() {
    return {
      padding: 20,
    };
  }
}

observer(App);
export default App;

const containerStyle = {
  width: '100%',
  height: '100%',
  background: '#EEE',
  color: '#333',
};

const chartContainerStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
};

const toggleOrientation = () => {
  store.setOrientation(store.orientation === 'horizontal' ? 'vertical' : 'horizontal');
};