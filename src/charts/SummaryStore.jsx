import { decorate, observable } from 'mobx';
import PropTypes from 'prop-types';
import numeral from 'numeral';

class SummaryStore {
  constructor(props) {
    this.data = props.data;
    this.onClick = props.onClick;
    this.getColor = props.getColor || (obj => obj.color);
    this.formatLabelFn = props.formatLabelFn || (obj => obj.label);
    this.formatTooltipFn = props.formatTooltipFn || defaultFomratTooltipFn;
  }
}

decorate(SummaryStore, {
  data: observable,
  onClick: observable,
  getColor: observable,
  formatLabelFn: observable,
  formatTooltipFn: observable,
});

SummaryStore.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    count: PropTypes.number.isRequired,
    color: PropTypes.string,
  })).isRequired,
  onClick: PropTypes.func,
  getColor: PropTypes.func,
  formatLabelFn: PropTypes.func,
  formatTooltipFn: PropTypes.func,
};

export default SummaryStore;

const defaultFomratTooltipFn = obj => `${obj.label} [${numeral(obj.count).format('0.[0]a')}]`;