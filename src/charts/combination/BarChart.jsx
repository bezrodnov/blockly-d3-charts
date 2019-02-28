import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind, applyDecorators } from 'core-decorators';
import * as d3 from 'd3';
import numeral from 'numeral';

import ChartContext from './ChartContext';
import Tooltip from './Tooltip';

class BarChart extends Component {
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
    if (this.store) {
      this.chartId = this.store.addChart({
        chartType: 'bar',
        requiresSpace: true,
        renderChart: this.renderChart.bind(this),
        getValues: this.getValues.bind(this),
      });
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    if (this.chartId && this.store) {
      this.store.svg.selectAll(`g.charts .bar.${this.chartId}`).remove();
      this.store.removeChart(this.chartId);
    }
  }

  renderChart(data, size, offset) {
    if (this.unmounting) {
      return;
    }

    const { svg, valueScale, bandScale, isVertical } = this.store;
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
    this.setState({
      focusedDataItem: data,
      mouseXY: d3.mouse(this.svgParent),
    });
  }

  onMouseOut() {
    this.setState({ focusedDataItem: null });
  }

  get svgParent() {
    return this.store.svg.node().parentNode;
  }
}

BarChart.propTypes = {
  measure: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  formatTooltip: PropTypes.func,
};
BarChart.defaultProps = {
  formatTooltip: (dimension, value) => `${dimension}: ${numeral(value).format('0.[0]a')}`,
};
applyDecorators(BarChart, {
  getMeasureValue: [autobind],
  onMouseMove: [autobind],
  onMouseOut: [autobind],
});
BarChart.displayName = 'BarChart';
export default BarChart;