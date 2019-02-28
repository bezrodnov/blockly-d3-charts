import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import ChartContext from './ChartContext';

export default class AxisX extends Component {
  constructor() {
    super(...arguments);
    this.renderAxis = this.renderAxis.bind(this);
  }

  render() {
    return <ChartContext.Consumer>{this.renderAxis}</ChartContext.Consumer>;
  }

  renderAxis(context) {
    const { svg, scaleX } = context;
    return svg && scaleX
      ? <Axis context={context} {...this.props} />
      : null;
  }
}

AxisX.propTypes = {
  position: PropTypes.oneOf(['top', 'bottom', 'zero']),
  labelColor: PropTypes.string,
  tickColor: PropTypes.string,
  axisColor: PropTypes.string,
};

AxisX.defaultProps = {
  position: 'bottom',
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
    const { margin, scaleX } = context;
    
    const transform = `translate(${margin.left}, ${this.offsetTop})`;
    this.axisRef.setAttribute('transform', transform);

    // delete d3 internal variable and all child nodes to fix the issue with 
    // text anchor/position, which occurres when position changes
    delete this.axisRef.__axis;
    d3.select(this.axisRef).selectAll('*').remove();

    const alignFn = position === 'top' ? d3.axisTop : d3.axisBottom;
    d3.select(this.axisRef)
      .attr('text-anchor', '')
      .call(alignFn(scaleX));
    
    d3.select(this.axisRef).selectAll('g.tick text')
      .attr('fill', labelColor);
    
    d3.select(this.axisRef).selectAll('g.tick line')
      .attr('stroke', tickColor);
    
    d3.select(this.axisRef).selectAll('g path')
      .attr('stroke', axisColor);
  }

  get offsetTop() {
    const { position, context } = this.props;
    const marginOffset = context.margin.top;
    switch (position) {
      case 'bottom':
        return context.height + marginOffset;
      case 'zero':
        return context.scaleY(0) + marginOffset;
      case 'top':
        return marginOffset;
      default:
        return 0;
    }
  }
}