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
        {context => {
          this.context = context;
          return this.renderTooltip();
        }}
      </ChartContext.Consumer>
    );
  }

  componentDidMount() {
    if (this.context) {
      this.chartId = this.context.addChart({
        chartType: 'area',
        requiresSpace: false,
        renderChart: this.renderChart.bind(this),
        getValues: this.getValues.bind(this),
      });
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    if (this.chartId && this.context) {
      this.context.svg.selectAll(`.area.${this.chartId}`).remove();
      this.context.removeChart(this.chartId);
    }
  }

  renderChart(data, size) {
    if (this.unmounting) {
      return;
    }

    const { svg, scaleX, scaleY, orientation } = this.context;
    
    const isVertical = orientation === 'vertical';
    const valueScale = isVertical ? scaleY : scaleX;
    const bandScale = isVertical ? scaleX : scaleY;
    
    const area = d3.area()
      .x(d => bandScale(d[0]))
      .y0(valueScale(0))
      .y1(d => valueScale(this.getMeasureValue(d)));

    svg.append('path')
      .attr('class', `area.${this.chartId}`)
      .datum(data)
      .attr('fill', this.props.color)
      .attr('fill-opacity', 0.7)
      .attr('d', area);
    
    svg.selectAll(`path.area.${this.chartId}`)
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
    // this.setState({
    //   focusedDataItem: data,
    //   mouseXY: d3.mouse(this.svgParent),
    // });
  }

  onMouseOut() {
    this.setState({ focusedDataItem: null });
  }

  get svgParent() {
    return this.context.container.parentNode;
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