import createReactContext from 'create-react-context';
const ChartContext = createReactContext({
  svg: null,
  scaleX: null,
  scaleY: null,
  margin: {},
  width: null,
  height: null,

  /**
   * Chart orientaion, one of 'horizontal', 'vertical'
   */
  orientation: null,

  /**
   * Charts in the combination chart container must register themselves
   * upon mount by providing chart type, a function to render chart and 
   * a `requiresSpace` flag.
   * @returns chart ID registered in the combination chart container.
   */
  addChart: ({ chartType, renderChart, requiresSpace }) => '',

  /**
   * Charts in the combination chart container must unregister themselves
   * using chart ID, which was assigned during `addChart` call.
   */
  removeChart: chartId => {},
});
export default ChartContext;