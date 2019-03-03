import React, { Component, Fragment } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { autobind, applyDecorators } from 'core-decorators';
import * as d3 from 'd3';
import numeral from 'numeral';

import ChartContext from './ChartContext';
import Tooltip from './Tooltip';

export default class BarChartWrapper extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <BarChart store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

BarChartWrapper.propTypes = {
  measure: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  formatTooltip: PropTypes.func,
};
BarChartWrapper.defaultProps = {
  formatTooltip: (dimension, value) => 
    `${dimension}: ${numeral(value).format('0.[0]a')}`,
};

class BarChart extends Component {
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
        chartType: 'bar',
        requiresSpace: true,
      });
    });
  }

  componentWillUnmount() {
    if (this.chartId && this.props.store) {
      this.props.store.svg.selectAll(`g.charts .bar.${this.chartId}`).remove();
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
    const offset = store.getChartOffset(this.chartId);

    const chartContainer = svg.selectAll('g.charts');
    
    const getStartX = d => isVertical
      ? bandScale(d[0]) + offset
      : valueScale(0);
    const getStartY = d => isVertical
      ? valueScale(0)
      : bandScale(d[0]) + offset;

    const getX = d => isVertical
      ? getStartX(d)
      : valueScale(Math.min(this.getMeasureValue(d), 0));
    const getY = d => isVertical
      ? valueScale(Math.max(this.getMeasureValue(d), 0))
      : getStartY(d);

    chartContainer.selectAll(`.bar.${this.chartId}`)
      .data(data)
      .enter().append('rect')
      .attr('class', `bar ${this.chartId}`)
      .attr('x', getStartX)
      .attr('y', getStartY)
      .attr('width', isVertical ? size : 0)
      .attr('height', isVertical ? 0 : size)
      .attr('fill', this.props.color);
    
    chartContainer.selectAll(`.bar.${this.chartId}`)
      .attr('measure-value', this.getMeasureValue)
      .on('mousemove', this.onMouseMove)
      .on('mouseout', this.onMouseOut)
      .transition()
      .duration(500)
      .attr('x', getX)
      .attr('y', getY)
      .attr('fill', this.props.color)
      .attr('height', d => isVertical
        ? Math.abs(valueScale(0) - valueScale(this.getMeasureValue(d)))
        : size
      )
      .attr('width', d => isVertical
        ? size
        : Math.abs(valueScale(0) - valueScale(this.getMeasureValue(d)))
      );
    
    chartContainer.selectAll(`.bar.${this.chartId}`)
      .exit()
      .remove();
    
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
    this.setState({
      focusedDataItem: data,
      mouseXY: d3.mouse(this.svgParent),
    });
  }

  onMouseOut() {
    this.setState({ focusedDataItem: null });
  }

  get svgParent() {
    return this.props.store.svg.node().parentNode;
  }
}

observer(BarChart);
applyDecorators(BarChart, {
  chartId: [observable],
  getMeasureValue: [autobind],
  onMouseMove: [autobind],
  onMouseOut: [autobind],
});
BarChart.displayName = 'BarChart';