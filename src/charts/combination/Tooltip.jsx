import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Popper } from 'react-popper';
import { observer } from 'mobx-react';

const GlobalThemeStore = {
  theme: {
    backgroundColor: 'white',
    color: 'black',
    borderColor: 'black',
  },
};


class Tooltip extends Component {
  render() {
    const popupStyle = this.getPopupStyle();
    const { dataItem, x, y, measure, format, container } = this.props;

    const rect = { top: y, left: x, right: x, bottom: y, width: 0, height: 0 };
    const referenceElement = {
      getBoundingClientRect: () => rect,
      clientWidth: () => 0,
      clientHeight: () => 0,
    };

    const [dimension, measures] = dataItem;
    const tooltipText = format(dimension, measures[measure], measure);

    return ReactDOM.createPortal(
      <Popper referenceElement={referenceElement} placement="top" positionFixed={true}>
        {({ ref, style, placement }) => (
          <div ref={ref} style={Object.assign({}, style, popupStyle)} data-placement={placement}>
            {tooltipText}
          </div>
        )}
      </Popper>,
      container
    );
  }

  getPopupStyle() {
    return {
      pointerEvents: 'none',
      position: 'absolute',
      background: GlobalThemeStore.theme.backgroundColor,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: GlobalThemeStore.theme.borderColor,
      color: GlobalThemeStore.theme.textColor,
      fontSize: 12,
      fontFamily: '"Open Sans"',
      padding: 2,
      whiteSpace: 'nowrap',
    };
  }
}

observer(Tooltip);
Tooltip.displayName = 'Tooltip';
export default Tooltip;