import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import ChartContext from './ChartContext';

export default class AxisY extends Component {
  constructor() {
    super(...arguments);
    this.renderAxis = this.renderAxis.bind(this);
  }

  render() {
    return <ChartContext.Consumer>{this.renderAxis}</ChartContext.Consumer>;
  }

  renderAxis(context) {
    const { svg, scaleY } = context;
    return svg && scaleY
      ? <Axis context={context} {...this.props} />
      : null;
  }
}

AxisY.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  labelColor: PropTypes.string,
  tickColor: PropTypes.string,
  axisColor: PropTypes.string,
};
AxisY.defaultProps = {
  position: 'left',
  labelColor: '#33F',
  tickColor: '#33F',
  axisColor: '#33F',
};

class Axis extends Component {
  constructor() {
    super(...arguments);
    this.onAxisRef = this.onAxisRef.bind(this);
  }

  render() {
    return <g ref={this.onAxisRef} />;
  }

  componentDidUpdate() {
    this.alignAxis();
  }

  onAxisRef(axis) {
    this.axisRef = axis;
    this.alignAxis();
  }

  alignAxis() {
    if (!this.axisRef || !this.props.context) {
      return;
    }
    const { position, labelColor, tickColor, axisColor, context } = this.props;
    const { margin } = context;
    
    const transform = `translate(${this.offsetLeft}, ${margin.top})`;
    this.axisRef.setAttribute('transform', transform);

    // delete d3 internal variable and all child nodes to fix the issue with 
    // text anchor/position, which occurres when position changes
    delete this.axisRef.__axis;
    d3.select(this.axisRef).selectAll('*').remove();

    const alignFn = position === 'right' ? d3.axisRight : d3.axisLeft;
    d3.select(this.axisRef)
      .call(alignFn(context.scaleY));
    
    d3.select(this.axisRef).selectAll('g.tick text')
      .attr('fill', labelColor);
    
    d3.select(this.axisRef).selectAll('g.tick line')
      .attr('stroke', tickColor);
    
    d3.select(this.axisRef).selectAll('g path')
      .attr('stroke', axisColor);
  }

  get offsetLeft() {
    const { position, context } = this.props;
    const marginOffset = context.margin.left;
    switch (position) {
      case 'right':
        return context.width + marginOffset;
      case 'zero':
        return context.scaleX(0) + marginOffset;
      case 'left':
        return marginOffset;
      default:
        return 0;
    }
  }
}