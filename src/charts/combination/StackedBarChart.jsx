import React, { Component, Fragment } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { autobind, applyDecorators } from 'core-decorators';
import * as d3 from 'd3';
import numeral from 'numeral';

import ChartContext from './ChartContext';
import Tooltip from './Tooltip';

class StackedBarChartWrapper extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <StackedBarChart store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

StackedBarChartWrapper.propTypes = {
  measures: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  formatTooltip: PropTypes.func,
};
StackedBarChartWrapper.defaultProps = {
  formatTooltip: (dimension, value) =>
    `${dimension}: ${numeral(value).format('0.[0]a')}`,
};
export default StackedBarChartWrapper;

class StackedBarChart extends Component {
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
      chartType: 'stackedbar',
      requiresSpace: true,
    });
  }

  componentWillUnmount() {
    const { store } = this.props;
    if (this.chartId && store) {
      store.svg.selectAll(`g.charts rect.stackedbar.${this.chartId}`).remove();
      store.removeChart(this.chartId);
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

      chartContainer.selectAll(`.stackedbar.${this.chartId}.measure-${index}`)
        .data(data)
        .enter().append('rect')
        .attr('class', `stackedbar ${this.chartId} measure-${index}`)
        .attr('x', getStartX)
        .attr('y', getStartY)
        .attr('width', isVertical ? size : 0)
        .attr('height', isVertical ? 0 : size)
        .attr('fill', color);
      
      chartContainer.selectAll(`.stackedbar.${this.chartId}.measure-${index}`)
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
      
      chartContainer.selectAll(`.stackedbar.${this.chartId}.measure-${index}`)
        .exit()
        .remove();
    });

    return null;
  }

  syncStore() {
    let minValue = 0;
    let maxValue = 0;
    this.props.store.data.forEach(d => {
      this.props.measures.forEach((measure, index) => {
        const value = this.getMeasureValue(d, index);
        if (value < minValue) {
          minValue = value;
        } else if (value > maxValue) {
          maxValue = value;
        }
      });
    });

    if (this.chartId) {
      this.props.store.setChartMinMaxValue(this.chartId, minValue, maxValue);
    }
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
    return this.props.store.svg.node().parentNode;
  }
}

observer(StackedBarChart);
applyDecorators(StackedBarChart, {
  chartId: [observable],
  onMouseOut: [autobind],
});
StackedBarChart.displayName = 'StackedBarChart';