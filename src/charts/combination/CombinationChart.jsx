import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import * as d3 from 'd3';

import ChartContext from './ChartContext';
import CombinationChartStore from './CombinationChartStore';
import BarChart from './BarChart';
import StackedBarChart from './StackedBarChart';
import AreaChart from './AreaChart';
import ValueAxis from './ValueAxis';
import BandAxis from './BandAxis';

class CombinationChart extends Component {
  static get Store() {
    return CombinationChartStore;
  }
  
  static get AreaChart() {
    return AreaChart;
  }

  static get BarChart() {
    return BarChart;
  }

  static get StackedBarChart() {
    return StackedBarChart;
  }

  static get ValueAxis() {
    return ValueAxis;
  }

  static get BandAxis() {
    return BandAxis;
  }

  static get ChartContext() {
    return ChartContext;
  }

  constructor() {
    super(...arguments);

    this.svgRef = React.createRef();
  }

  render() {
    const { children, store } = this.props;
    return (
      <div style={this.style}>
        <svg ref={this.svgRef} style={{ shapeRendering: 'crispEdges' }}>
          <ChartContext.Provider value={store}>
            {children}
          </ChartContext.Provider>
        </svg>
      </div>
    );
  }

  componentDidMount() {
    const { store } = this.props;
    
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

  get chartStyle() {
    const { margin } = this.props.chartStyle || {};
    const getMarginValue = t => margin && margin[t]
      ? margin[t]
      : DEFAULT_CHART_STYLE.margin[t];

    return {
      margin: {
        top: getMarginValue('top'),
        bottom: getMarginValue('bottom'),
        left: getMarginValue('left'),
        right: getMarginValue('right'),
      },
    };
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