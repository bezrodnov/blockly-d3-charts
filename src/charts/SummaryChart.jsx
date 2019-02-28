import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { reaction } from 'mobx';
import PropTypes from 'prop-types';

import SummaryStore from './SummaryStore';

class SummaryChart extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      width: 10,
      height: 10,
    };

    this.onCanvasRef = this.onCanvasRef.bind(this);

    reaction(
      () => this.props.store.data.map(d => ({ ...d })),
      data => {
        this.bindData(data);
        this.updateChart();
      }
    );
  }

  componentDidMount() {
    this.virtualDOM = document.createElement('custom');
    this.bindData(this.props.store.data);
    this.onResize();

    d3.select(this.canvas)
      .on('click', this.onClick.bind(this))
      .on('mousemove', this.onMouseMove.bind(this))
      .on('mouseout', this.onMouseOut.bind(this));
  }

  onResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const { width, height } = rect;
    this.setState({ width, height });
  }

  render() {
    const { chartType, store, animationDuration, chartStyle, showLabels,
      showTooltips, ...other } = this.props;
    const { width, height } = this.state;
    return (
      <div {...other} >
        <canvas width={width} height={height} ref={this.onCanvasRef} />
      </div>
    );
  }

  onCanvasRef(ref) {
    this.canvas = ref;
  }

  bindData(data) {
    if (!this.canvas) {
      return;
    }
    const { store } = this.props;
    this.chartContainer = d3.select(this.virtualDOM);

    const arcs = this.chartContainer.selectAll('custom.arc')
      .data(data, d => d.label);
    
    // calculate angles for all nodes
    const pieData = d3.pie().sort(null).value(d => d.count)(data);
    const getPie = ({ label }) => pieData.find(p => p.data.label === label);

    // handle new nodes addition
    arcs.enter()
      .append('custom')
      .attr('class', 'arc')
      .attr('id', d => d.label)
      .attr('startAngle', d => getPie(d).endAngle)
      .attr('endAngle', d => getPie(d).endAngle)
      .attr('alpha', 0)
      .attr('color', d => store.getColor(d));
    
    // mark exiting nodes with an "exit" class
    arcs.exit().attr('class', 'arc exit');
    
    // add pie data for the nodes being removed - find previous active node and 
    // use its end angle, if there is no one - set end angle equal to start 
    const allArcs = this.chartContainer.selectAll('custom.arc');
    allArcs.each((data, i, nodes) => {
      const node = nodes[i];
      if (node.classList.contains('exit')) {
        let startAngle = getStartAngle(node);
        for (let j = i - 1; j >= 0; j--) {
          if (!nodes[j].classList.contains('exit')) {
            const label = nodes[j].getAttribute('id');
            startAngle = getPie({ label }).endAngle;
            break;
          }
        }
        pieData.push({ data, startAngle, endAngle: startAngle });
      }
    });
    
    // expand and fade-in new nodes
    this.withAnimation(allArcs)
      .attr('startAngle', d => getPie(d).startAngle)
      .attr('endAngle', d => getPie(d).endAngle)
      .attr('alpha', 1)
      .attr('color', d => store.getColor(d));

    // collapse and fade-out removed nodes
    this.withAnimation(arcs.exit())
      .attr('startAngle', d => getPie(d).startAngle)
      .attr('endAngle', d => getPie(d).endAngle)
      .attr('alpha', 0)
      .remove();

    // trigger chart re-rendering (with animation)
    this.updateChart();
  }

  updateChart() {
    const timer = d3.timer(elapsed => {
      this.draw();
      if (elapsed > this.props.animationDuration) {
        timer.stop();
      }
    });
  }

  draw() {
    const { chartType, chartStyle } = this.props;
    const { margin, holeRadiusPercentage } = chartStyle;
    const { width, height } = this.canvas;

    const context = this.canvas.getContext('2d');
    context.restore();
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(width / 2, height / 2);
    
    const radius = Math.min(width, height) / 2 - margin;
    this.arcBuilder = d3.arc()
      .outerRadius(radius)
      .innerRadius(chartType === 'donut' ? radius * holeRadiusPercentage : 0)
      .context(context);
    this.arcs = this.chartContainer.selectAll('custom.arc');

    this.drawArcs(context);
    this.drawLabels(context);
    this.drawTooltip(context);
  }

  drawArcs(context) {
    this.arcs.each((data, i, nodes) => {
      const node = nodes[i];
      const startAngle = getStartAngle(node);
      const endAngle = getEndAngle(node);
      const color = node.getAttribute('color');
      context.beginPath();
      this.arcBuilder({ startAngle, endAngle });
      context.fillStyle = color;
      context.fill();
    });
  }

  drawLabels(context) {
    const { chartStyle, store, showLabels, chartType } = this.props;
    if (!showLabels) {
      return;
    }

    const { margin, holeRadiusPercentage, labelFontSize, labelFontFamily,
      labelFontColor, labelLineColor } = chartStyle;
    const { width, height } = this.canvas;
    const outerRadius = Math.min(width, height) / 2 - margin;
    const innerRadius = outerRadius * (chartType === 'donut' ? holeRadiusPercentage : 0);
    const outerArc = d3.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);
    
    context.textAlign = 'center';
    context.fillStyle = labelFontColor;
    context.font = `${labelFontSize}px ${labelFontFamily}`;
    context.strokeStyle = labelLineColor;


    this.arcs.each((data, i, nodes) => {
      const node = nodes[i];
      const startAngle = getStartAngle(node);
      const endAngle = getEndAngle(node);
      const c = outerArc.centroid({ startAngle, endAngle });

      context.globalAlpha = getAlpha(node);

      const ratio = (outerRadius + 10) / (outerRadius + innerRadius) * 2;
      const labelX = c[0] * ratio;
      const labelY = c[1] * ratio;

      context.textAlign = labelX >= 0 ? 'left' : 'right';
      context.textBaseline = labelY >= 0 ? 'top' : 'bottom';
      context.fillText(store.formatLabelFn(data), labelX, labelY);

      context.beginPath();
      context.moveTo(labelX, labelY);
      context.lineTo(c[0], c[1]);
      context.stroke();
    });
  }

  drawTooltip(context) {
    const { showTooltips, store, chartStyle } = this.props;
    if (!showTooltips || !this.tooltipSliceId) {
      return;
    }
    // check if referenced item is still in the store
    const item = store.data.find(d => d.label === this.tooltipSliceId);
    if (!item) {
      return;
    }
    const { tooltipFontSize, tooltipFontFamily, tooltipFontColor,
      tooltipMargin, tooltipBackgroundColor, tooltipBorderWidth,
      tooltipBorderColor } = chartStyle;
    const { width, height } = this.state;
    const x = this.tooltipXY.x - width / 2;
    const y = this.tooltipXY.y - height / 2;
    const tooltip = store.formatTooltipFn(item);
      
    context.font = `${tooltipFontSize}px ${tooltipFontFamily}`;
    const textWidth = context.measureText(tooltip).width;
      
    const margin = tooltipMargin;
    const bW = tooltipBorderWidth;

    const rectW = textWidth + 2 * margin;
    const rectH = tooltipFontSize + 2 * margin;
    const rectX = x - (x >= 0 ? rectW + bW : -bW);
    const rectY = y - rectH - bW;
    // draw border first
    context.fillStyle = tooltipBorderColor;
    context.fillRect(rectX - bW, rectY - bW, rectW + 2 * bW, rectH + 2 * bW);
    // then draw background
    context.fillStyle = tooltipBackgroundColor;
    context.fillRect(rectX, rectY, rectW, rectH);
    // and finally draw tooltip text
    context.fillStyle = tooltipFontColor;
    context.textAlign = x >= 0 ? 'right' : 'left';
    context.textBaseline = 'middle';
    const offset = (x >= 0 ? -1 : 1) * (margin + tooltipBorderWidth);
    context.fillText(tooltip, x + offset, y - rectH / 2 - bW);
  }

  withAnimation(s) {
    return this.props.animationDuration > 0
      ? s.transition().duration(this.props.animationDuration)
      : s;
  }

  onClick() {
    const { store } = this.props;
    this.selectedLabel = this.getSliceIdByXY(this.getMouseXY());
    if (this.selectedLabel && store.onClick) {
      // check if referenced item is still in the store
      const item = store.data.find(d => d.label === this.selectedLabel);
      if (item) {
        store.onClick(item);
      }
    }
  }

  onMouseMove() {
    const xy = this.getMouseXY();
    const sliceId = this.getSliceIdByXY(xy);
    if (this.tooltipSliceId !== sliceId) {
      this.tooltipSliceId = sliceId;
      this.tooltipXY = xy;
      this.draw();
    } else if (this.tooltipSliceId) {
      this.tooltipXY = xy;
      this.draw();
    }
  }

  onMouseOut() {
    if (this.tooltipSliceId) {
      this.tooltipSliceId = null;
      this.draw();
    }
  }

  getMouseXY() {
    const [x, y] = d3.mouse(ReactDOM.findDOMNode(this));
    return { x, y };
  }

  getSliceIdByXY({ x, y }) {
    if (!this.canvas || !this.arcs) {
      return null;
    }

    const context = this.canvas.getContext('2d');
    const nodeAtXY = this.arcs.nodes().find(node => {
      const startAngle = getStartAngle(node);
      const endAngle = getEndAngle(node);
      context.beginPath();
      this.arcBuilder({ startAngle, endAngle });
      return context.isPointInPath(x, y);
    });
    return nodeAtXY && nodeAtXY.getAttribute('id');
  }
}

SummaryChart.propTypes = {
  store: PropTypes.instanceOf(SummaryStore).isRequired,
  chartType: PropTypes.oneOf(['pie', 'donut']),
  animationDuration: PropTypes.number.isRequired,
  showLabels: PropTypes.bool,
  showTooltips: PropTypes.bool,
  chartStyle: PropTypes.shape({
    margin: PropTypes.number,
    holeRadiusPercentage: PropTypes.number,
    labelFontSize: PropTypes.number,
    labelFontFamily: PropTypes.string,
    labelFontColor: PropTypes.string,
    labelLineColor: PropTypes.string,
    tooltipFontSize: PropTypes.number,
    tooltipFontFamily: PropTypes.string,
    tooltipFontColor: PropTypes.string,
    tooltipBackgroundColor: PropTypes.string,
    tooltipBorderColor: PropTypes.string,
    tooltipBorderWidth: PropTypes.number,
  }).isRequired,
};

SummaryChart.defaultProps = {
  animationDuration: 500,
  showLabels: true,
  showTooltips: true,
  chartStyle: {
    margin: 100,
    holeRadiusPercentage: 0.7,
    labelFontSize: 12,
    labelFontFamily: 'Open Sans',
    labelFontColor: '#000',
    labelLineColor: '#55F',
    tooltipFontSize: 14,
    tooltipFontFamily: 'Open Sans',
    tooltipFontColor: '#000',
    tooltipBackgroundColor: '#FFF',
    tooltipBorderColor: '#55F',
    tooltipBorderWidth: 2,
    tooltipMargin: 2,
  },
};

SummaryChart.displayName = 'SummaryChart';
export default SummaryChart;

const getStartAngle = node => Number(node.getAttribute('startangle'));
const getEndAngle = node => Number(node.getAttribute('endangle'));
const getAlpha = node => Number(node.getAttribute('alpha'));