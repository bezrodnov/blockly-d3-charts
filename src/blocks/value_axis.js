const { Blockly } = window;

Blockly.Blocks['value_axis'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendDummyInput()
      .appendField('Value Axis');
    
    this.setOutput(false);
    this.setColour(230);
    this.setTooltip('Value Axis');
  },
};

Blockly.JavaScript['value_axis'] = block => {
  if (block.getRootBlock().type !== 'combination_chart') {
    return '';
  }
  const output = `\n  .addValueAxis()`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};