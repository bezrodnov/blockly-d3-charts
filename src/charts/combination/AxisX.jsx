import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import * as d3 from 'd3';

import ChartContext from './ChartContext';

class AxisX extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <Axis store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
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

AxisX.displayName = 'AxisX';
export default AxisX;


class Axis extends Component {
  render() {
    const { position, labelColor, tickColor, axisColor, store } = this.props;
    const { svg, isVertical, valueScale, bandScale } = store;
    const scaleX = isVertical ? bandScale : valueScale;
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

    const marginLeft = svg.select('g.charts').attr('margin-left');
    const transform = `translate(${marginLeft}, ${this.offsetTop})`;
    this.axisRef.setAttribute('transform', transform);

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
    
    return null;
  }

  get offsetTop() {
    const { position, store } = this.props;
    const marginOffset = Number(store.svg.select('g.charts').attr('margin-top'));
    switch (position) {
      case 'bottom':
        return store.height + marginOffset;
      case 'zero':
        const { isVertical, valueScale, bandScale } = store;
        return (isVertical ? valueScale(0) : bandScale(0)) + marginOffset;
      case 'top':
        return marginOffset;
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