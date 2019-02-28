import React, { Component } from 'react';
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
        {store => {
          this.store = store;
          return this.renderTooltip();
        }}
      </ChartContext.Consumer>
    );
  }

  componentDidMount() {
    this.chartId = this.store.addChart({
      chartType: 'area',
      requiresSpace: false,
      renderChart: this.renderChart.bind(this),
      getValues: this.getValues.bind(this),
    });
  }

  componentWillUnmount() {
    this.unmounting = true;
    if (this.chartId && this.store) {
      this.store.svg.selectAll(`g.charts .area.${this.chartId}`).remove();
      this.store.removeChart(this.chartId);
    }
  }

  renderChart(data, size) {
    if (this.unmounting) {
      return;
    }

    const { svg, valueScale, bandScale, isVertical } = this.store;
    const chartContainer = svg.select('g.charts');
    // remove previously rendered chart first
    //chartContainer.selectAll(`.area.${this.chartId}`).remove();
    
    const offset = size / 2;
    const area = d3.area()
      .x(d => bandScale(d[0]) + offset)
      .y0(valueScale(0))
      .y1(d => valueScale(this.getMeasureValue(d)));

    chartContainer
      .datum(data)
      .append('path')
      .attr('class', `area ${this.chartId}`)
      .attr('fill', this.props.color)
      .attr('fill-opacity', 0.7);

    chartContainer.select(`path.area.${this.chartId}`)
      .transition()
      .duration(500)
      .attr('transform', isVertical ? '' : `scale(1, -1) rotate(-90)`)
      .attr('d', area);
  }

  getValues(data) {
    return data.map(this.getMeasureValue);
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
    return this.store.svg.node().parentNode;
  }
}

AreaChart.propTypes = {
  measure: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  formatTooltip: PropTypes.func,
};
AreaChart.defaultProps = {
  formatTooltip: (dimension, value) => `${dimension}: ${numeral(value).format('0.[0]a')}`,
};
applyDecorators(AreaChart, {
  getMeasureValue: [autobind],
  onMouseMove: [autobind],
  onMouseOut: [autobind],
});
AreaChart.displayName = 'AreaChart';
export default AreaChart;