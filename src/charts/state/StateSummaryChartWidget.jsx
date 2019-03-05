import React, { Component } from 'react';
import { decorate, observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';

import CombinationChart from '../combination/CombinationChart';
import StateSummaryAxis from './StateSummaryAxis';
import { autobind } from 'core-decorators';


const { ChartContext, Store, ValueAxis, StackedBarChart } = CombinationChart;

class StateSummaryChartWidget extends Component {
  constructor() {
    super(...arguments);

    this.store = new StateWidgetStore({
      data: this.props.data,
      chartStyle: this.chartChartStyle,
    });
  }

  render() {
    const { isChartMode } = this.store;
    const valueAxis = isChartMode
      ? <ValueAxis tickColor="transparent" labelColor="#000" axisColor="#ccc" />
      : null;
    
    const stachedBarChart = isChartMode
      ? <StackedBarChart measures={this.measures} />
      : null;

    return (
      <div style={this.containerStyle} >
        <CombinationChart
          store={this.store.chartStore}
          style={this.chartStyle}
          chartStyle={this.store.chartStyle}
        >
          {valueAxis}
          <StateSummaryAxis
            tickColor="transparent"
            labelColor="#000"
            axisColor={isChartMode ? '#ccc' : 'transparent'}
          />
          {stachedBarChart}
        </CombinationChart>
        {this.renderSwitchModeicon()}
        {this.renderTable()}
      </div>
    );
  }

  renderSwitchModeicon() {
    return (
      <button
        tooltip="Switch mode"
        style={this.switchModeStyle}
        onClick={this.store.switchMode}
      >
        {this.store.isChartMode ? 'T' : 'G'}
      </button>
    );
  }

  renderTable() {
    const { isChartMode, tableStyle } = this.store;
    if (isChartMode) {
      return null;
    }
    const { data } = this.store.chartStore;
    return (
      <div style={tableStyle}>
        {data.reduce((cells, d, index) => {
          const style = {
            background: index % 2 == 0 ? 'transparent' : 'rgba(0,0,0,0.1)',
            alignSelf: 'stretch',
            textAlign: 'right',
            paddingRight: 20,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          };
          cells.push(<div style={style}></div>);
          this.measuresReversed.forEach(({ name }) => {
            cells.push(
              <div style={style}>
                {d[1][name]}
              </div>
            );
          });
          return cells;
        }, [])}
      </div>
    );
  }

  get measures() {
    const { isChartMode } = this.store;
    return this.store.chartStore.data.reduce((measures, d) => {
      Object.keys(d[1]).forEach(key => {
        if (key !== 'State' && measures.indexOf(key) === -1) {
          measures.push(key);
        }
      });
      return measures;
    }, []).map((name, index) => ({
      name,
      color: isChartMode ? getMeasureColor(index) : 'transparent',
    }));
  }

  get measuresReversed() {
    return [...this.measures].reverse();
  }

  get containerStyle() {
    return {
      position: 'relative',
      width: 700,
      height: 450,
      display: 'inline-block',
    };
  }

  get chartStyle() {
    return {
      width: '100%',
      height: '100%',
    };
  }

  get chartChartStyle() {
    return {
      width: 700,
      height: 450,
      margin: {
        left: 100,
        right: 100,
        top: 50,
        bottom: 50,
      },
    };
  }

  get switchModeStyle() {
    return {
      position: 'absolute',
      right: 20,
      top: 20,
      borderRadius: 5,
      outline: 'none',
    };
  }
}

const getMeasureColor = index => {
  // TODO: support more colors
  const COLORS = ['#B3E5FC', '#03A9F4', '#CC0000'];
  return COLORS[index % COLORS.length];
};

observer(StateSummaryChartWidget);
decorate(StateSummaryChartWidget, {
  measures: computed,
  measuresReversed: computed,
});
export default StateSummaryChartWidget;

/**
 * 
 */
class StateWidgetStore {
  constructor(cfg) {
    const { data, ...other } = cfg;
    Object.assign(this, other);

    this.chartStore = new Store({
      data,
      orientation: 'horizontal',
      bandScalePadding: 0.5,
    });

    this.mode = 'table';
  }

  switchMode() {
    this.mode = this.isChartMode ? 'table' : 'chart';
  }

  get isChartMode() {
    return this.mode === 'chart';
  }

  get tableStyle() {
    const { data, bandScalePadding } = this.chartStore;
    const { margin } = this.chartStyle;
    let height = this.chartStyle.height - margin.top - margin.bottom;
    const rowHeight = height / data.length;
    const offset = rowHeight * bandScalePadding / 2;
    height -= 2 * offset;
    return {
      position: 'absolute',
      left: 0,
      right: margin.right,
      top: margin.top + offset,
      height,
      display: 'grid',
      gridTemplateColumns: '100px 1fr 2fr 2fr',
      gridTemplateRows: 'auto',
      columnGap: 0,
      fontSize: 12,
    };
  }
}

decorate(StateWidgetStore, {
  chartStore: observable,
  mode: observable,
  chartStyle: observable,
  
  isChartMode: computed,
  tableStyle: computed,

  switchMode: [action, autobind],
});