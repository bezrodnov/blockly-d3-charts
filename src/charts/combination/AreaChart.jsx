import React, { Component, Fragment } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { autobind, applyDecorators } from 'core-decorators';
import * as d3 from 'd3';
import numeral from 'numeral';

import ChartContext from './ChartContext';
import Tooltip from './Tooltip';

class AreaChart extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <AreaChartInternal store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

AreaChart.propTypes = {
  measure: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  formatTooltip: PropTypes.func,
};
AreaChart.defaultProps = {
  formatTooltip: (dimension, value) =>
    `${dimension}: ${numeral(value).format('0.[0]a')}`,
};
export default AreaChart;

class AreaChartInternal extends Component {
  render() {
    return (
      <Fragment>
        {this.renderChart()}
        {this.renderTooltip()}
      </Fragment>
    );
  }

  componentDidMount() {
    runInAction(() => {
      this.chartId = this.props.store.addChart({
        chartType: 'area',
        requiresSpace: false,
      });
    });
  }

  componentWillUnmount() {
    if (this.chartId) {
      this.props.store.svg.selectAll(`g.charts .area.${this.chartId}`).remove();
      this.props.store.removeChart(this.chartId);
    }
  }

  renderChart() {
    const { store } = this.props;
    const { svg, valueScale, bandScale, isVertical, data } = store;
    this.syncStore();

    if (!this.chartId) {
      return null;
    }

    const size = store.getChartSize(this.chartId);
    const offset = size / 2;

    const chartContainer = svg.select('g.charts');
    
    const area = d3.area()
      .x(d => bandScale(d[0]) + offset)
      .y0(valueScale(0))
      .y1(d => valueScale(this.getMeasureValue(d)));

    chartContainer
      .datum(data)
      .append('path')
      .attr('class', `area ${this.chartId}`);

    chartContainer.select(`path.area.${this.chartId}`)
      .attr('fill-opacity', 0.7)
      .on('mousemove', this.onMouseMove)
      .on('mouseout', this.onMouseOut)
      .transition()
      .duration(500)
      .attr('fill', this.props.color)
      .attr('transform', isVertical ? '' : `scale(1, -1) rotate(-90)`)
      .attr('d', area);
    
    return null;
  }

  syncStore() {
    let minValue = 0;
    let maxValue = 0;
    this.props.store.data.forEach(d => {
      const value = this.getMeasureValue(d);
      if (value < minValue) {
        minValue = value;
      } else if (value > maxValue) {
        maxValue = value;
      }
    });

    if (this.chartId) {
      this.props.store.setChartMinMaxValue(this.chartId, minValue, maxValue);
    }
  }

  getMeasureValue(dataEntry) {
    return dataEntry[1][this.props.measure] || 0;
  }

  renderTooltip() {
    const { focusedDataItem, mouseXY } = this.state || {};
    if (!focusedDataItem || !mouseXY) {
      return null;
    }
    const [x, y] = mouseXY;
    const { measure, formatTooltip } = this.props;
    return (
      <Tooltip
        dataItem={focusedDataItem}
        measure={measure}
        format={formatTooltip}
        container={this.svgParent}
        x={x}
        y={y}
      />
    );
  }

  onMouseMove(data) {
    const { bandScale, isVertical } = this.props.store;
    const [x, y] = d3.mouse(this.svgParent);
    const size = this.props.store.getChartSize(this.chartId);

    const focusedDataItem = data.reduce((prev, curr) => {
      const currCoord = bandScale(curr[0]);
      const prevCoord = bandScale(prev[0]);

      if (isVertical) {
        const d = x - this.marginLeft - size / 2;
        return Math.abs(currCoord - d) <= Math.abs(prevCoord - d) ? curr : prev;
      } else {
        const d = y - this.marginTop - size / 2;
        return Math.abs(currCoord - d) <= Math.abs(prevCoord - d) ? curr : prev;
      }
    }, data[0]);

    this.setState({
      focusedDataItem,
      mouseXY: [x, y],
    });
  }

  onMouseOut() {
    this.setState({ focusedDataItem: null });
  }

  get marginLeft() {
    return Number(this.props.store.svg.select('g.charts').attr('margin-left'));
  }
  
  get marginTop() {
    return Number(this.props.store.svg.select('g.charts').attr('margin-top'));
  }

  get svgParent() {
    return this.props.store.svg.node().parentNode;
  }
}

observer(AreaChartInternal);
applyDecorators(AreaChartInternal, {
  chartId: [observable],
  getMeasureValue: [autobind],
  onMouseMove: [autobind],
  onMouseOut: [autobind],
});
AreaChartInternal.displayName = 'AreaChart';