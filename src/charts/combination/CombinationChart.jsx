import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import * as d3 from 'd3';

import ChartContext from './ChartContext';
import CombinationChartStore from './CombinationChartStore';

class CombinationChart extends Component {
  constructor() {
    super(...arguments);

    this.svgRef = React.createRef();
  }

  render() {
    const { children, store } = this.props;
    return (
      <div style={this.style}>
        <svg ref={this.svgRef}>
          <ChartContext.Provider value={store}>
            {children}
            {this.renderCharts()}
          </ChartContext.Provider>
        </svg>
      </div>
    );
  }

  renderCharts() {
    const { bandScale, charts, data } = this.props.store;
    const bandWidth = bandScale.bandwidth();
    
    // render chart which don't require additional space first
    let chartsRequiringSpace = 0;
    charts.forEach(chart => {
      if (chart.requiresSpace) {
        chartsRequiringSpace++;
      }
    });

    // render charts which require additional space
    let offset = 0;
    const size = bandWidth / chartsRequiringSpace;
    charts.forEach(chart => {
      if (chart.requiresSpace) {
        chart.renderChart(data, size, offset);
        offset += size;
      } else {
        chart.renderChart(data, bandWidth);
      }
    });
  }

  componentDidMount() {
    // remove existing charts (if any)
    d3.select(this.svgRef.current).selectAll('g.charts').remove();

    const { store } = this.props;
    if (!store.svg) {
      const rect = this.svgRef.current.parentNode.getBoundingClientRect();
      const margin = this.chartStyle.margin;
      const width = rect.width - margin.left - margin.right;
      const height = rect.height - margin.top - margin.bottom;
      const svg = d3.select(this.svgRef.current)
        .attr('width', rect.width)
        .attr('height', rect.height)
        .attr('inner-width', width)
        .attr('inner-height', height);
      
      svg.insert('g', 'g')
        .attr('class', 'charts')
        .attr('margin-left', margin.left)
        .attr('margin-right', margin.right)
        .attr('margin-top', margin.top)
        .attr('margin-bottom', margin.bottom)
        .attr('transform', `translate(${margin.left},${margin.top})`);
      store.setSvg(svg);
    }
  }

  get chartStyle() {
    return Object.assign(DEFAULT_CHART_STYLE, this.props.chartStyle);
  }

  get style() {
    return Object.assign({}, this.props.style, { position: 'relative' });
  }
}

CombinationChart.propTypes = {
  store: PropTypes.instanceOf(CombinationChartStore).isRequired,
  chartStyle: PropTypes.shape({
    margin: PropTypes.shape({
      top: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
      right: PropTypes.number,
    }),
  }),
};
CombinationChart.defaultProps = {
  orientation: 'vertical',
};

observer(CombinationChart);
CombinationChart.displayName = 'CombinationChart';
export default CombinationChart;

const DEFAULT_CHART_STYLE = {
  margin: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },
};