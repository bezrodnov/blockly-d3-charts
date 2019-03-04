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
    
    this.appendDummyInput()
      .appendField('band scale padding:')
      .appendField(new Blockly.FieldNumber(0.5, 0.1, 0.8), 'BAND_SCALE_PADDING');

    this.setNextStatement(true, 'combination_chart_element');
    this.setOutput(false);
    this.setColour(160);
    this.setTooltip('Charts container');
  },
};

Blockly.JavaScript['combination_chart'] = block => {
  const orientation = block.getFieldValue('ORIENTATION');
  const bandScalePadding = block.getFieldValue('BAND_SCALE_PADDING');
  const output = `CombinationChartManager.getChartBuilder('${block.chartId}')
    .setOrientation('${orientation}')
    .setBandScalePadding(${bandScalePadding})`;
  return Blockly.JavaScript.joinCombinationChartElements(block, output);
};

Blockly.JavaScript.joinCombinationChartElements = (block, output) => {
  if (block.getRootBlock().type !== 'combination_chart') {
    return '';
  }
  
  const nextElement = Blockly.JavaScript.statementToCode(
    block,
    'combination_chart_element'
  );
  const end = block.nextConnection.isConnected() ? '' : '\n  .build()';
  return output + nextElement + end;
};