import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import * as d3 from 'd3';

import ChartContext from './ChartContext';

class ValueAxis extends Component {
  render() {
    return (
      <ChartContext.Consumer>
        {store => <Axis store={store} {...this.props} />}
      </ChartContext.Consumer>
    );
  }
}

ValueAxis.propTypes = {
  verticalPosition: PropTypes.oneOf(['top', 'bottom']),
  horizontalPosition: PropTypes.oneOf(['left', 'right']),
  labelColor: PropTypes.string,
  tickColor: PropTypes.string,
  axisColor: PropTypes.string,
};

ValueAxis.defaultProps = {
  verticalPosition: 'bottom',
  horizontalPosition: 'left',
  labelColor: '#33F',
  tickColor: '#33F',
  axisColor: '#33F',
};

ValueAxis.displayName = 'ValueAxis';
export default ValueAxis;


class Axis extends Component {
  render() {
    const { labelColor, tickColor, axisColor, store } = this.props;
    const { svg, isVertical, valueScale } = store;
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
      ${isVertical ? this.offsetLeft : this.marginLeft},
      ${isVertical ? this.marginLeft : this.offsetTop}
    )`;
    this.axisRef.setAttribute('transform', transform);

    d3.select(this.axisRef)
      .attr('text-anchor', '')
      .call(this.alignFn(valueScale));
    
    d3.select(this.axisRef).selectAll('g.tick text')
      .attr('fill', labelColor);
    
    d3.select(this.axisRef).selectAll('g.tick line')
      .attr('stroke', tickColor);
    
    d3.select(this.axisRef).selectAll('g path')
      .attr('stroke', axisColor);
    
    return null;
  }

  get marginLeft() {
    return Number(this.props.store.svg.select('g.charts').attr('margin-left'));
  }
  
  get marginTop() {
    return Number(this.props.store.svg.select('g.charts').attr('margin-top'));
  }

  get offsetTop() {
    const { verticalPosition, store } = this.props;
    return this.marginTop + (verticalPosition === 'bottom' ? store.height : 0);
  }

  get offsetLeft() {
    const { horizontalPosition, store } = this.props;
    return this.marginLeft + (horizontalPosition === 'right' ? store.width : 0);
  }

  get alignFn() {
    const { isVertical } = this.props.store;
    if (isVertical) {
      return this.props.horizontalPosition === 'left' ? d3.axisLeft : d3.axisRight;
    }
    return this.props.verticalPosition === 'top' ? d3.axisTop : d3.axisBottom;
  }

  componentWillUnmount() {
    if (this.axisRef) {
      this.axisRef.remove();
    }
  }
}

observer(Axis);