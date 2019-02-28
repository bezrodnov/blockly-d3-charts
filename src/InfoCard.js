import React, { Component } from 'react';
import { decorate, computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import { Collections, GlobalThemeStore } from '@onenetwork-plt/react-core';
const { merge } = Collections;

class InfoCard extends Component {
  render() {
    return (
      <div style={this.style}>
        {this.props.children}
      </div>
    );
  }

  get style() {
    return merge({
      borderRadius: 5,
      borderColor: GlobalThemeStore.theme.fieldBorderColor,
      borderWidth: 1,
      borderStyle: 'solid',
    }, this.props.style);
  }
}

observer(InfoCard);
decorate(InfoCard, {
  style: computed,
});
InfoCard.displayName = 'InfoCard';

class InfoCardLine extends Component {
  render() {
    return (
      <div style={this.containerStyle}>
        <div style={this.iconContainerStyle}>
          <span style={this.iconStyle} className={this.props.icon} />
        </div>
        <div style={this.contentContainerStyle}>
          {this.renderContentColumns()}
        </div>
      </div>
    );
  }

  renderContentColumns() {
    return this.props.data.map(data => {
      return <div style={this.contentColumnStyle}>
        <div style={this.labelStyle}>{data.label}</div>
        <div style={this.valueStyle}>{data.value}</div>
      </div>;
    });
  }

  get containerStyle() {
    return {
      width: '100%',
      display: 'flex',
    };
  }

  get iconContainerStyle() {
    return {
      width: 30,
      backgrondColor: GlobalThemeStore.theme.textColor,
      color: GlobalThemeStore.theme.textColorInverse,
    };
  }

  get iconStyle() {
    return merge({
      width: 20,
      height: 20,
    }, this.props.iconStyle);
  }

  get contentContainerStyle() {
    return {
      flex: 1,
      backgrondColor: GlobalThemeStore.theme.backgrondColor,
      color: GlobalThemeStore.theme.textColor,
      display: 'flex',
    };  
  }

  get contentColumnStyle() {
    return {
      flex: 1,
    };
  }

  get labelStyle() {
    return {
      fontSize: 12,
    };
  }

  get valueStyle() {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'no-wrap',
    };
  }
}

InfoCardLine.propTypes = {
  icon: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType(PropTypes.object, PropTypes.string).isRequired,
  })),
  iconStyle: PropTypes.object,
};

observer(InfoCardLine);
decorate(InfoCardLine, {
  containerStyle: computed,
  iconContainerStyle: computed,
  iconStyle: computed,
  contentContainerStyle: computed,
  contentColumnStyle: computed,
  labelStyle: computed,
  valueStyle: computed,
});
InfoCardLine.displayName = 'InfoCardLine';


export { InfoCard, InfoCardLine };
