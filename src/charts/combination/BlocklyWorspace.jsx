const { Blockly } = window;
Blockly.FieldColour.COLOURS.push('rgba(0,0,0,0)');

export default class BlocklyWorspace {
  constructor(containerId, toolboxId) {
    this.measures = [];
    this.customBlockTypes = [];

    this.workspace = Blockly.inject(containerId, {
      toolbox: document.getElementById(toolboxId),
      trashcan: true,
      scrollbars: true,
    });

    this.workspace.getMeasureDropdown = () =>
      new Blockly.FieldDropdown(() => this.measures.map(m => [m, m]));

    this.workspace.addChangeListener(e => {
      const code = Blockly.JavaScript.workspaceToCode(this.workspace);
      try {
        eval(code);
      } catch (err) {
        console.log(code);
        console.error(err);
      }

      this.workspace.registerToolboxCategoryCallback('CUSTOM_COMPONENTS', this.getCustomComponents.bind(this));
    });
  }

  get instance() {
    return this.workspace;
  }

  getCustomComponents() {
    return this.customBlockTypes.reduce((blockTypes, blockType) => {
      if (Blockly.Blocks[blockType]) {
        blockTypes.push(Blockly.Xml.textToDom(`<xml><block type="${blockType}"></block></xml>`).firstChild);
      }
      return blockTypes;
    }, []);
  }

  addCustomBlockType(type) {
    if (this.customBlockTypes.indexOf(type) === -1) {
      this.customBlockTypes.push(type);
    }
  }

  setMeasures(measures) {
    this.measures = measures;
  }
}