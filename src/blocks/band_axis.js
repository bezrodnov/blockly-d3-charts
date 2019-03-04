const { Blockly } = window;

Blockly.Blocks['band_axis'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendDummyInput()
      .appendField('Band Axis');
    
    this.appendDummyInput()
      .appendField('horizontal position:')
      .appendField(new Blockly.FieldDropdown([
        ['left', 'left'],
        ['right', 'right'],
        ['zero', 'zero'],
      ]), 'H_POS');
      
    this.appendDummyInput()
      .appendField('vertical position:')
      .appendField(new Blockly.FieldDropdown([
        ['bottom', 'bottom'],
        ['top', 'top'],
        ['zero', 'zero'],
      ]), 'V_POS');

    this.setInputsInline(true);

    this.setOutput(false);
    this.setColour(230);
    this.setTooltip('Band Axis');
  },
};

Blockly.JavaScript['band_axis'] = block => {
  const hPos = block.getFieldValue('H_POS');
  const vPos = block.getFieldValue('V_POS');
  const output = `\n  .addBandAxis({ hPos: '${hPos}', vPos: '${vPos}' })`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};