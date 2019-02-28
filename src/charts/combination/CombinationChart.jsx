import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reaction } from 'mobx';
import * as d3 from 'd3';

import ChartContext from './ChartContext';
import CombinationChartStore from './CombinationChartStore';

class CombinationChart extends Component {
  constructor() {
    super(...arguments);

    this.svgRef = React.createRef();

    this.state = {
      svg: null,
      charts: new Map(),
      addChart: this.addChart.bind(this),
      removeChart: this.removeChart.bind(this),
    };

    reaction(
      () => {
        const { data } = this.props.store;
        return { data, trigger: data.every(d => null) };
      },
      this.syncState.bind(this),
      { fireImmediately: true }
    );
  }

  render() {
    const { chartStyle, orientation, children, store, ...other} = this.props;
    return (
      <div {...other} style={this.style}>
        <svg ref={this.svgRef}>
          <ChartContext.Provider value={this.state}>
            {children}
          </ChartContext.Provider>
        </svg>
      </div>
    );
  }

  collectDomainValues() {
    const { orientation, store } = this.props;
    const dimensionValues = store.data.map(d => d[0]);

    this.xDomain = [];
    this.yDomain = [];

    if (orientation === 'horizontal') {
      this.yDomain = dimensionValues;
      this.xDomain = this.collectChartValues();
      this.xDomain = [d3.min(this.xDomain), d3.max(this.xDomain)];
    } else {
      this.xDomain = dimensionValues;
      this.yDomain = this.collectChartValues();
      this.yDomain = [d3.min(this.yDomain), d3.max(this.yDomain)];
    }
  }

  collectChartValues() {
    const values = [0];
    for (const chart of this.state.charts.values()) {
      chart.getValues(this.props.store.data).forEach(v => values.push(v));
    }
    return values;
  }

  onResize() {
    this.syncState();
  }

  syncState() {
    if (!this.svgRef.current) {
      if (!this.syncStateInterval) {
        this.syncStateInterval = setInterval(this.syncState.bind(this), 50);
      }
      return;
    }
    clearInterval(this.syncStateInterval);
    delete this.syncStateInterval;
    
    this.collectDomainValues();

    const rect = this.svgRef.current.parentNode.getBoundingClientRect();
    const margin = this.chartStyle.margin;
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;
    
    // Scale the range of the data in the domains
    const scaleFn = isValueDomain => isValueDomain
      ? d3.scaleLinear().nice()
      : d3.scaleBand().padding(0.1);

    const scaleX = scaleFn(this.props.orientation === 'horizontal')
      .range([0, width])
      .domain(this.xDomain);

    const scaleY = scaleFn(this.props.orientation === 'vertical')
      .range([height, 0])
      .domain(this.yDomain);

    // remove existing group (if any)
    const container = this.svgRef.current;
    d3.select(container).selectAll('g.charts').remove();

    // append a 'group' element to 'svg'
    // move the 'group' element to the top left margin
    const svg = d3.select(container)
      .attr('width', rect.width)
      .attr('height', rect.height)
      .insert('g', 'g')
      .attr('class', 'charts')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const { orientation } = this.props;
    this.setState({ svg, scaleX, scaleY, width, height, margin, orientation, container });
  }

  componentDidMount() {
    this.syncState();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.orientation !== this.props.orientation
      || prevState.charts !== this.state.charts) {
      this.syncState();
      return;
    }

    const { scaleX, scaleY } = this.state;
    const charts = this.state.charts.values();
    const bandWidth = this.props.orientation === 'horizontal'
      ? scaleY.bandwidth()
      : scaleX.bandwidth();
    
    // render chart which don't require additional space first
    let chartsRequiringSpace = 0;
    for (const chart of charts) {
      if (!chart.requiresSpace) {
        chart.renderChart(this.props.store.data, bandWidth);
      } else {
        chartsRequiringSpace++;
      }
    }

    // render charts which require additional space
    let offset = 0;
    const size = bandWidth / chartsRequiringSpace;
    this.state.charts.forEach(chart => {
      if (chart.requiresSpace) {
        chart.renderChart(this.props.store.data, size, offset);
        offset += size;
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.syncStateInterval);
    delete this.syncStateInterval;
  }

  addChart(chart) {
    const chartId = chartIdGenerator();
    this.setState(state => {
      const charts = new Map(state.charts);
      charts.set(chartId, chart);
      return { charts };
    });
    return chartId;
  }

  removeChart(chartId) {
    this.setState(state => {
      const charts = new Map(state.charts);
      charts.delete(chartId);
      return { charts };
    });
    return chartId;
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
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
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

let chartIdSeq = 0;
const chartIdGenerator = () => `chart-${chartIdSeq++}`;