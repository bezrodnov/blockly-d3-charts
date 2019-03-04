const { Blockly } = window;

Blockly.Blocks['measure_settings'] = {
  init: function() {
    this.setPreviousStatement(true, 'measure_settings');
    this.setNextStatement(true, 'measure_settings');

    const measureInput = this.appendDummyInput()
      .appendField('measure:');
    
    if (this.workspace.getMeasureDropdown) {
      measureInput.appendField(this.workspace.getMeasureDropdown(), 'MEASURE');
    }
      
    this.appendDummyInput()
      .appendField('color:')
      .appendField(new Blockly.FieldColour('#00F'), 'COLOR');
    
    this.setInputsInline(true);
    this.setOutput(false);
    this.setColour(360);
  },
};

Blockly.JavaScript['measure_settings'] = block => {
  const measure = block.getFieldValue('MEASURE');
  const color = block.getFieldValue('COLOR');
  return `\n    { name: '${measure}', color: '${color}' },`
    + Blockly.JavaScript.statementToCode(
      block,
      'measure_settings',
      Blockly.JavaScript.ORDER_ADDITION
    ) || '';
};