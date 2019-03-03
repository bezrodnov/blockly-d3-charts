const { Blockly } = window;

let chartId = 1;

Blockly.Blocks['combination_chart'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Combination Chart');
    this.setNextStatement(true, 'combination_chart_element');
    
    this.chartId = chartId++;
    this.setOutput(false);
    this.setColour(160);
    this.setTooltip('Charts container');
  },
};

Blockly.JavaScript['combination_chart'] = block => {
  const output = `CombinationChartManager.getChartBuilder('${block.chartId}')`;
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