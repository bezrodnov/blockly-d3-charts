import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import * as d3 from 'd3';

import ChartContext from './charts/combination/ChartContext';

class BandStateMachineAxis extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <Axis store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

BandStateMachineAxis.propTypes = {
  verticalPosition: PropTypes.oneOf(['top', 'bottom', 'zero']),
  horizontalPosition: PropTypes.oneOf(['left', 'right', 'zero']),
  labelColor: PropTypes.string,
  tickColor: PropTypes.string,
  axisColor: PropTypes.string,
};

BandStateMachineAxis.defaultProps = {
  verticalPosition: 'bottom',
  horizontalPosition: 'left',
  labelColor: '#33F',
  tickColor: '#33F',
  axisColor: '#33F',
  transitionColor: '#C9C9D3',
};

BandStateMachineAxis.displayName = 'BandStateMachineAxis';
export default BandStateMachineAxis;

class Axis extends Component {
  render() {
    const { labelColor, tickColor, axisColor, transitionColor } = this.props;
    const { svg, isVertical, bandScale, data } = this.props.store;
    if (!svg) {
      return null;
    }
    if (this.axisRef) {
      // delete d3 internal variable and all child nodes to fix the issue with 
      // text anchor/position, which occurres when position changes
      delete this.axisRef.__axis;
      d3.select(this.axisRef).selectAll('*').remove();
      this.axisRef.remove();
    }
    this.axisRef = svg.append('g').node();

    const transform = `translate(
      ${isVertical ? this.marginLeft : this.offsetLeft},
      ${isVertical ? this.offsetTop : this.marginTop}
    )`;
    this.axisRef.setAttribute('transform', transform);

    d3.select(this.axisRef)
      .attr('text-anchor', '')
      .call(this.alignFn(bandScale));
    
    d3.select(this.axisRef).selectAll('g.tick text')
      .attr('fill', labelColor);
    
    d3.select(this.axisRef).selectAll('g.tick line')
      .attr('stroke', tickColor);
    
    d3.select(this.axisRef).selectAll('g path')
      .attr('stroke', axisColor);
    
    const ticks = d3.select(this.axisRef).selectAll('g.tick').nodes();
    ticks.forEach((tick, i) => {
      const isCircle = i === data.length - 1 || i === 0;
      const selection = d3.select(tick);
      const transform = selection.attr('transform')
        + ` translate(${isVertical ? 0 : -20}, ${isVertical ? 20 : 0})`;
      
      selection
        .attr('transform', transform)
        .append(isCircle ? 'circle' : 'rect')
        .attr('r', 5)
        .attr('cx', isCircle && !isVertical ? 5 : 0)
        .attr('x', !isCircle && isVertical ? -5 : 0)
        .attr('y', isCircle ? 0 : -5)
        .attr('width', 10)
        .attr('height', 10)
        .attr('stroke', transitionColor)
        .attr('stroke-width', 2);
      
      if (i === 0) {
        selection
          .append('circle')
          .attr('r', 1)
          .attr('cx', isCircle && !isVertical ? 5 : 0)
          .attr('stroke', transitionColor)
          .attr('stroke-width', 2);
      }
      
      if (i < data.length - 1) {
        const nextTick = ticks[i + 1];
        const r1 = tick.firstChild.getBoundingClientRect();
        const r2 = nextTick.firstChild.getBoundingClientRect();
        
        selection.append('line')
          .attr('x2', isVertical ? 17 : 5)
          .attr('y2', isVertical ? 0 : -17)
          .attr('x1', isVertical ? r2.left - r1.left - 15 : 5)
          .attr('y1', isVertical ? 0 : r2.top - r1.top + 8)
          .attr('stroke', transitionColor)
          .attr('stroke-width', 1)
          .attr('marker-end', 'url(#state-machine-axis-arrow)');
      }
    });
    
    return (
      <defs>
        <marker id="state-machine-axis-arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill={transitionColor} />
        </marker>
      </defs>
    );
  }

  get marginLeft() {
    return Number(this.props.store.svg.select('g.charts').attr('margin-left'));
  }
  
  get marginTop() {
    return Number(this.props.store.svg.select('g.charts').attr('margin-top'));
  }

  get offsetTop() {
    const { verticalPosition, store } = this.props;
    if (verticalPosition === 'zero') {
      return this.marginTop + store.valueScale(0);
    }
    return this.marginTop + (verticalPosition === 'bottom' ? store.height : 0);
  }

  get offsetLeft() {
    const { horizontalPosition, store } = this.props;
    if (horizontalPosition === 'zero') {
      return this.marginLeft + store.valueScale(0);
    }
    return this.marginLeft + (horizontalPosition === 'right' ? store.width : 0);
  }

  get alignFn() {
    const { isVertical } = this.props.store;
    if (isVertical) {
      return this.props.verticalPosition === 'top' ? d3.axisTop : d3.axisBottom;
    }
    return this.props.horizontalPosition === 'right' ? d3.axisRight : d3.axisLeft;
  }

  componentWillUnmount() {
    if (this.axisRef) {
      this.axisRef.remove();
    }
  }
}

observer(Axis);