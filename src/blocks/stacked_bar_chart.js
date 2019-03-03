const { Blockly } = window;

Blockly.Blocks['stacked_bar_chart'] = {
  init: function() {
    this.setPreviousStatement(true, 'combination_chart_element');
    this.setNextStatement(true, 'combination_chart_element');

    this.appendStatementInput('MEASURES')
      .setCheck('measure_settings')
      .appendField('Stacked Bar Chart');
    
    this.setOutput(false);
    this.setColour(360);
    this.setTooltip('Renders stacked bar chart for provided measures');
  },
};

Blockly.JavaScript['stacked_bar_chart'] = block => {
  if (block.getRootBlock().type !== 'combination_chart') {
    return '';
  }

  const measures = Blockly.JavaScript.statementToCode(block, 'MEASURES');
  const output = `\n  .addChart('stackedbar', {measures:[${measures}]})`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};