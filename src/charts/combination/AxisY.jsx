import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import * as d3 from 'd3';

import ChartContext from './ChartContext';

class AxisY extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <Axis store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

AxisY.propTypes = {
  position: PropTypes.oneOf(['left', 'bottom', 'right']),
  labelColor: PropTypes.string,
  tickColor: PropTypes.string,
  axisColor: PropTypes.string,
};

AxisY.defaultProps = {
  position: 'bottom',
  labelColor: '#33F',
  tickColor: '#33F',
  axisColor: '#33F',
};

AxisY.displayName = 'AxisY';
export default AxisY;


class Axis extends Component {
  render() {
    const { position, labelColor, tickColor, axisColor, store } = this.props;
    const { svg, isVertical, valueScale, bandScale, data } = store;
    const scaleY = isVertical ? valueScale : bandScale;
    if (!svg) {
      return null;
    }
    if (this.axisRef) {
      // delete d3 internal variable and all child nodes to fix the issue with 
      // text anchor/position, which occurres when position changes
      delete this.axisRef.__axis;
      d3.select(this.axisRef).selectAll('*').remove();
    } else {
      this.axisRef = svg.append('g').node();
    }

    const marginTop = svg.select('g.charts').attr('margin-top');
    const transform = `translate(${this.offsetLeft}, ${marginTop})`;
    this.axisRef.setAttribute('transform', transform);

    const alignFn = position === 'right' ? d3.axisRight : d3.axisLeft;
    d3.select(this.axisRef)
      .attr('text-anchor', '')
      .call(alignFn(scaleY));
    
    d3.select(this.axisRef).selectAll('g.tick text')
      .attr('fill', labelColor);
    
    d3.select(this.axisRef).selectAll('g.tick line')
      .attr('stroke', tickColor);
    
    d3.select(this.axisRef).selectAll('g path')
      .attr('stroke', axisColor);
    
    return null;
  }

  get offsetLeft() {
    const { position, store } = this.props;
    const marginOffset = Number(store.svg.select('g.charts').attr('margin-left'));
    switch (position) {
      case 'left':
        return marginOffset;
      case 'zero':
        const { isVertical, valueScale, bandScale } = store;
        return (isVertical ? bandScale(0) : valueScale(0)) + marginOffset;
      case 'right':
        return store.width + marginOffset;
      default:
        return 0;
    }
  }

  componentWillUnmount() {
    if (this.axisRef) {
      this.axisRef.remove(); // TODO: test/validate
    }
  }
}

observer(Axis);