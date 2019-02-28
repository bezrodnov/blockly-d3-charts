import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind, applyDecorators } from 'core-decorators';
import * as d3 from 'd3';
import numeral from 'numeral';

import ChartContext from './ChartContext';
import Tooltip from './Tooltip';

class StackedBarChart extends Component {
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
        chartType: 'stackedbar',
        requiresSpace: true,
        renderChart: this.renderChart.bind(this),
        getValues: this.getValues.bind(this),
      });
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    if (this.chartId && this.context) {
      this.context.svg.selectAll(`.stackedbar.${this.chartId}`).remove();
      this.context.removeChart(this.chartId);
    }
  }

  renderChart(data, size, offset) {
    if (this.unmounting) {
      return;
    }

    const { svg, scaleX, scaleY, orientation } = this.context;
    
    const isVertical = orientation === 'vertical';
    const valueScale = isVertical ? scaleY : scaleX;
    const bandScale = isVertical ? scaleX : scaleY;
    
    const { measures } = this.props;
    measures.forEach((measure, index) => {
      const { name, color } = measure;

      const getStartX = d => isVertical
        ? bandScale(d[0]) + offset
        : valueScale(0);
      const getStartY = d => isVertical
        ? valueScale(0)
        : bandScale(d[0]) + offset;
  
      const getX = d => isVertical
        ? getStartX(d)
        : valueScale(Math.min(this.getMeasureValue(d, index), 0));
      const getY = d => isVertical
        ? valueScale(Math.max(this.getMeasureValue(d, index), 0))
        : getStartY(d);

      svg.selectAll(`.stackedbar.${this.chartId}-${index}`)
        .data(data)
        .enter().append('rect')
        .attr('class', `stackedbar ${this.chartId}-${index}`)
        .attr('x', getStartX)
        .attr('y', getStartY)
        .attr('width', isVertical ? size : 0)
        .attr('height', isVertical ? 0 : size)
        .attr('fill', color);
      
      svg.selectAll(`.stackedbar.${this.chartId}-${index}`)
        .attr('measure-value', d => this.getMeasureValue(d, index))
        .on('mousemove', d => this.onMouseMove(d, name))
        .on('mouseout', this.onMouseOut)
        .transition()
        .duration(500)
        .attr('x', getX)
        .attr('y', getY)
        .attr('fill', color)
        .attr('height', d => isVertical
          ? Math.abs(valueScale(0) - valueScale(this.getMeasureValue(d, index)))
          : size
        )
        .attr('width', d => isVertical
          ? size
          : Math.abs(valueScale(0) - valueScale(this.getMeasureValue(d, index)))
        );
      
      svg.selectAll(`.stackedbar.${this.chartId}-${index}`)
        .exit()
        .remove();
    });
  }

  getValues(data) {
    return data.reduce((values, dataEntry) => {
      this.props.measures.forEach((measure, index) => {
        values.push(this.getMeasureValue(dataEntry, index));
      });
      return values;
    }, []);
  }

  getMeasureValue(dataEntry, measureIndex) {
    return this.props.measures.reduce((value, measureConfig, i) => {
      if (measureIndex <= i) {
        value += (dataEntry[1][measureConfig.name] || 0);
      }
      return value;
    }, 0);
  }

  renderTooltip() {
    const { focusedDataItem, focusedMeasure, mouseXY } = this.state || {};
    if (!focusedDataItem || !focusedMeasure || !mouseXY) {
      return null;
    }
    const [x, y] = mouseXY;
    const { formatTooltip } = this.props;
    return (
      <Tooltip
        dataItem={focusedDataItem}
        measure={focusedMeasure}
        format={formatTooltip}
        container={this.svgParent}
        x={x}
        y={y}
      />
    );
  }

  onMouseMove(focusedDataItem, focusedMeasure) {
    this.setState({
      focusedDataItem,
      focusedMeasure,
      mouseXY: d3.mouse(this.svgParent),
    });
  }

  onMouseOut() {
    this.setState({ focusedDataItem: null });
  }

  get svgParent() {
    return this.context.container.parentNode;
  }
}

StackedBarChart.propTypes = {
  measures: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  formatTooltip: PropTypes.func,
};
StackedBarChart.defaultProps = {
  formatTooltip: (dimension, value) => `${dimension}: ${numeral(value).format('0.[0]a')}`,
};
applyDecorators(StackedBarChart, {
  getMeasureValue: [autobind],
  onMouseMove: [autobind],
  onMouseOut: [autobind],
});
StackedBarChart.displayName = 'StackedBarChart';
export default StackedBarChart;