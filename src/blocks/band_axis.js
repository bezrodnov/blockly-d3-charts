const { Blockly } = window;

Blockly.Blocks['band_axis'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendDummyInput()
      .appendField('Band Axis');
    
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
    this.setColour(230);
    this.setTooltip('Band Axis');
  },
};

Blockly.JavaScript['band_axis'] = block => {
  const hPos = block.getFieldValue('H_POS');
  const vPos = block.getFieldValue('V_POS');
  const tickColor = block.getFieldValue('TICK_COLOR');
  const axisColor = block.getFieldValue('AXIS_COLOR');
  const labelColor = block.getFieldValue('LABEL_COLOR');
  const output = `\n  .addBandAxis({
    horizontalPosition:'${hPos}',
    verticalPosition:'${vPos}',
    tickColor:'${tickColor}',
    axisColor:'${axisColor}',
    labelColor:'${labelColor}',
  })`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};