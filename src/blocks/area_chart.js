const { Blockly } = window;

Blockly.Blocks['area_chart'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendDummyInput()
      .appendField('Area Chart');

    const measureInput = this.appendDummyInput()
      .appendField('measure:');
    
    if (this.workspace.getMeasureDropdown) {
      measureInput.appendField(this.workspace.getMeasureDropdown(), 'MEASURE');
    }
      
    this.appendDummyInput()
      .appendField('color:')
      .appendField(new Blockly.FieldColour('#0F0'), 'COLOR');
    
    this.setInputsInline(true);
    this.setOutput(false);
    this.setColour(360);
    this.setTooltip('Renders area chart');
  },
};

Blockly.JavaScript['area_chart'] = block => {
  const measure = block.getFieldValue('MEASURE');
  const color = block.getFieldValue('COLOR');
  const output = `\n  .addChart('area', {measure:'${measure}',color:'${color}'})`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};