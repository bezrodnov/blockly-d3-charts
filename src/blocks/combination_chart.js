const { Blockly } = window;

let chartId = 1;

Blockly.Blocks['combination_chart'] = {
  init: function() {
    this.chartId = chartId++;

    this.appendDummyInput()
      .appendField('Combination Chart');
      
    this.appendDummyInput()
      .appendField('orientation:')
      .appendField(new Blockly.FieldDropdown([
        ['vertical', 'vertical'],
        ['horizontal', 'horizontal'],
      ]), 'ORIENTATION');

    this.setInputsInline(true);
    this.setNextStatement(true, 'combination_chart_element');
    this.setOutput(false);
    this.setColour(160);
    this.setTooltip('Charts container');
  },
};

Blockly.JavaScript['combination_chart'] = block => {
  const orientation = block.getFieldValue('ORIENTATION');
  const output = `CombinationChartManager.getChartBuilder('${block.chartId}')
    .setOrientation('${orientation}')`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};

Blockly.JavaScript.joinCombinationChartElements = (block, output) => {
  const nextElement = Blockly.JavaScript.statementToCode(
    block,
    'combination_chart_element'
  );
  const end = block.nextConnection.isConnected() ? '' : '\n  .build()';
  return output + nextElement + end;
};