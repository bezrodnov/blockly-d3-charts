import React, { Component } from 'react';
import { applyDecorators, autobind } from 'core-decorators';
import './blocks/Blocks';
import BlocklyWorkspace from './charts/combination/BlocklyWorspace';

const { Blockly } = window;

class BlocklyContainer extends Component {
  constructor() {
    super(...arguments);
    this.state = { collapsed: false };
  }

  componentDidMount() {
    this.workspace = new BlocklyWorkspace('blocklyDiv', 'toolbox');
    this.workspace.setMeasures(this.props.measures);

    addCustomStateBandAxis(this.workspace);

    addDemoBlocks(this.workspace.instance, this.props.measures, 'horizontal', 20, 20);
    addDemoBlocks(this.workspace.instance, this.props.measures, 'vertical', 520, 20);

    if (window.localStorage
      && window.localStorage.getItem('blockly-default-collapsed') !== 'false') {
      setTimeout(() => {
        this.setState({ collapsed: true });
      }, 1000);
    }
  }

  render() {
    return <div>
      <div id="blocklyDiv" style={this.blocklyWorkspaceStyle}/>
      <div
        style={this.collapserStyle}
        onClick={this.onCollapserClick}
        role="button"
        tabIndex="-1"
        title="Click to collapse/expand"
      />
    </div>;
  }

  onCollapserClick() {
    if (window.localStorage) {
      window.localStorage.setItem('blockly-default-collapsed', !this.isCollapsed);
    }
    this.setState({ collapsed: !this.isCollapsed });
  }

  get isCollapsed() {
    return this.state && this.state.collapsed;
  }

  get blocklyWorkspaceStyle() {
    const height = this.isCollapsed ? 0 : 400;
    return {
      height,
      transition: 'height 0.3s ease-in',
    };
  }

  get collapserStyle() {
    return {
      height: 15,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.65) 100%)',
      borderRadius: 5,
      cursor: 'pointer',
      outline: 'none',
    };
  }
}

applyDecorators(BlocklyContainer, {
  onCollapserClick: [autobind],
});
export default BlocklyContainer;

const addDemoBlocks = (workspace, measures, orientation, dx, dy) => {
  const chart = workspace.newBlock('combination_chart');
  chart.setFieldValue(orientation, 'ORIENTATION');
  chart.setFieldValue(0.7, 'BAND_SCALE_PADDING');
  chart.moveBy(dx, dy);
  chart.initSvg();
  chart.render();

  const valueAxis = workspace.newBlock('value_axis');
  valueAxis.setFieldValue('rgba(0,0,0,0)', 'TICK_COLOR');
  chart.nextConnection.connect(valueAxis.previousConnection);
  valueAxis.initSvg();
  valueAxis.render();

  const bandAxis = workspace.newBlock('state_band_axis');
  bandAxis.setFieldValue('rgba(0,0,0,0)', 'TICK_COLOR');
  valueAxis.nextConnection.connect(bandAxis.previousConnection);
  bandAxis.initSvg();
  bandAxis.render();

  const stackedBarChart = workspace.newBlock('stacked_bar_chart');
  bandAxis.nextConnection.connect(stackedBarChart.previousConnection);
  stackedBarChart.initSvg();
  stackedBarChart.render();
  
  const COLORS = ['#B3E5FC', '#03A9F4', '#CC0000'];
  let previousConnection = stackedBarChart.getFirstStatementConnection();
  measures.forEach((m, index) => {
    const measure = workspace.newBlock('measure_settings');
    measure.setFieldValue(m, 'MEASURE');
    measure.setFieldValue(COLORS[index], 'COLOR');
    previousConnection.connect(measure.previousConnection);
    previousConnection = measure.nextConnection;
    measure.initSvg();
    measure.render();
  });
};

const addCustomStateBandAxis = (workspace) => {
  Blockly.Blocks['state_band_axis'] = {
    init: function() {
      this.setPreviousStatement(true, 'combination_chart_element');
      this.setNextStatement(true, 'combination_chart_element');

      this.appendDummyInput()
        .appendField('State Machine Band Axis');
    
      this.appendDummyInput()
        .appendField('position')
        .appendField('horizontal:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left'],
          ['right', 'right'],
          ['zero', 'zero'],
        ]), 'H_POS')
        .appendField('vertical:')
        .appendField(new Blockly.FieldDropdown([
          ['bottom', 'bottom'],
          ['top', 'top'],
          ['zero', 'zero'],
        ]), 'V_POS');
    
      this.appendDummyInput()
        .appendField('color')
        .appendField('tick:')
        .appendField(new Blockly.FieldColour('#ccc'), 'TICK_COLOR')
        .appendField('axis:')
        .appendField(new Blockly.FieldColour('#ccc'), 'AXIS_COLOR')
        .appendField('label:')
        .appendField(new Blockly.FieldColour('#333'), 'LABEL_COLOR');

      this.setOutput(false);
      this.setColour(180);
      this.setTooltip('State Machine Band Axis');
    },
  };

  Blockly.JavaScript['state_band_axis'] = block => {
    const hPos = block.getFieldValue('H_POS');
    const vPos = block.getFieldValue('V_POS');
    const tickColor = block.getFieldValue('TICK_COLOR');
    const axisColor = block.getFieldValue('AXIS_COLOR');
    const labelColor = block.getFieldValue('LABEL_COLOR');
    const output = `\n  .addAxis({
      type:'band_state_machine',
      horizontalPosition:'${hPos}',
      verticalPosition:'${vPos}',
      tickColor:'${tickColor}',
      axisColor:'${axisColor}',
      labelColor:'${labelColor}',
    })`;
    return Blockly.JavaScript.joinCombinationChartElements(block, output);
  };

  workspace.addCustomBlockType('state_band_axis');
};