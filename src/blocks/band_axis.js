const { Blockly } = window;

Blockly.Blocks['band_axis'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendDummyInput()
      .appendField('Band Axis');
    
    this.setOutput(false);
    this.setColour(230);
    this.setTooltip('Band Axis');
  },
};

Blockly.JavaScript['band_axis'] = block => {
  if (block.getRootBlock().type !== 'combination_chart') {
    return '';
  }
  const output = `\n  .addBandAxis()`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};