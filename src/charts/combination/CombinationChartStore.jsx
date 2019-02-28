import { decorate, observable, action } from 'mobx';

class CombinationChartStore {
  constructor(props) {
    Object.assign(this, props);
  }

  setData(data) {
    this.data = data;
  }
}

decorate(CombinationChartStore, {
  data: observable,
  setData: action,
});
export default CombinationChartStore;