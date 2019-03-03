import React, { Component, Fragment } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { autobind, applyDecorators } from 'core-decorators';
import * as d3 from 'd3';
import numeral from 'numeral';

import ChartContext from './ChartContext';
import Tooltip from './Tooltip';

class AreaChartWrapper extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <AreaChart store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

AreaChartWrapper.propTypes = {
  measure: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  formatTooltip: PropTypes.func,
};
AreaChartWrapper.defaultProps = {
  formatTooltip: (dimension, value) =>
    `${dimension}: ${numeral(value).format('0.[0]a')}`,
};
export default AreaChartWrapper;

class AreaChart extends Component {
  render() {
    return (
      <Fragment>
        {this.renderChart()}
        {this.renderTooltip()}
      </Fragment>
    );
  }

  componentDidMount() {
    this.chartId = this.props.store.addChart({
      chartType: 'area',
      requiresSpace: false,
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
    // this.setState({
    //   focusedDataItem: data,
    //   mouseXY: d3.mouse(this.svgParent),
    // });
  }

  onMouseOut() {
    this.setState({ focusedDataItem: null });
  }

  get svgParent() {
    return this.props.store.svg.node().parentNode;
  }
}

observer(AreaChart);
applyDecorators(AreaChart, {
  chartId: [observable],
  getMeasureValue: [autobind],
  onMouseMove: [autobind],
  onMouseOut: [autobind],
});
AreaChart.displayName = 'AreaChart';