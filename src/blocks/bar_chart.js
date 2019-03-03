const { Blockly } = window;

Blockly.Blocks['bar_chart'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendDummyInput()
      .appendField('Bar Chart');

    const measureInput = this.appendDummyInput()
      .appendField('measure:');
    
    if (this.workspace.getMeasureDropdown) {
      measureInput.appendField(this.workspace.getMeasureDropdown(), 'MEASURE');
    }
      
    this.appendDummyInput()
      .appendField('color:')
      .appendField(new Blockly.FieldColour('#ff0000'), 'COLOR');
    
    this.setInputsInline(true);
    this.setOutput(false);
    this.setColour(360);
    this.setTooltip('Renders bar chart');
  },
};

Blockly.JavaScript['bar_chart'] = block => {
  if (block.getRootBlock().type !== 'combination_chart') {
    return '';
  }

  const measure = block.getFieldValue('MEASURE');
  const color = block.getFieldValue('COLOR');
  const output = `\n  .addChart('bar', {measure:'${measure}',color:'${color}'})`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};