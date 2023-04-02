const selection = figma.currentPage.selection;

const appendPosition = (origin, clone) => {
  clone.x = origin.x;
  clone.y = origin.y;

  const componentLayerIndex = origin.parent.children.indexOf(origin);
  origin.parent.insertChild(componentLayerIndex, clone);
};

const cloneComponentSet = (componentSet) => {
  const newFrame = figma.createFrame();
  // clone frame properties
  newFrame.name = componentSet.name;
  newFrame.x = componentSet.x;
  newFrame.y = componentSet.y;
  newFrame.resize(componentSet.width, componentSet.height);
  // clone style properties
  newFrame.fills = componentSet.fills;
  newFrame.strokes = componentSet.strokes;
  newFrame.strokeWeight = componentSet.strokeWeight;
  newFrame.strokeAlign = componentSet.strokeAlign;
  newFrame.strokeCap = componentSet.strokeCap;
  newFrame.strokeJoin = componentSet.strokeJoin;
  newFrame.dashPattern = componentSet.dashPattern;
  newFrame.cornerRadius = componentSet.cornerRadius;
  newFrame.cornerSmoothing = componentSet.cornerSmoothing;
  newFrame.effects = componentSet.effects;
  newFrame.opacity = componentSet.opacity;
  newFrame.blendMode = componentSet.blendMode;
  newFrame.isMask = componentSet.isMask;
  newFrame.clipsContent = componentSet.clipsContent;
  newFrame.backgrounds = componentSet.backgrounds;
  newFrame.layoutMode = componentSet.layoutMode;
  newFrame.counterAxisSizingMode = componentSet.counterAxisSizingMode;
  newFrame.primaryAxisSizingMode = componentSet.primaryAxisSizingMode;
  newFrame.paddingLeft = componentSet.paddingLeft;
  newFrame.paddingRight = componentSet.paddingRight;
  newFrame.paddingTop = componentSet.paddingTop;
  newFrame.paddingBottom = componentSet.paddingBottom;
  newFrame.itemSpacing = componentSet.itemSpacing;
  newFrame.layoutAlign = componentSet.layoutAlign;
  newFrame.layoutGrow = componentSet.layoutGrow;
  newFrame.guides = componentSet.guides;
  newFrame.expanded = componentSet.expanded;
  newFrame.locked = componentSet.locked;
  newFrame.visible = componentSet.visible;
  newFrame.backgroundStyleId = componentSet.backgroundStyleId;
  newFrame.fillStyleId = componentSet.fillStyleId;
  newFrame.strokeStyleId = componentSet.strokeStyleId;

  // clone children
  componentSet.children.forEach((child) => {
    const newInstance = child.createInstance();
    newInstance.x = child.x;
    newInstance.y = child.y;

    newFrame.appendChild(newInstance);
  });

  return newFrame;
};

const loopSelection = (selection) => {
  // loop through the selection
  selection.forEach((node) => {
    if (node.type === "INSTANCE") {
      const detached = node.detachInstance();
      loopSelection(detached.children);
    }

    if (
      node.type === "FRAME" ||
      node.type === "GROUP" ||
      node.type === "SECTION"
    ) {
      loopSelection(node.children);
    }

    if (node.type === "COMPONENT") {
      const newInstance = node.createInstance();

      appendPosition(node, newInstance);
      node.remove();

      const detached = newInstance.detachInstance();
      loopSelection(detached.children);
    }

    if (node.type === "COMPONENT_SET") {
      const newFrame = cloneComponentSet(node);
      appendPosition(node, newFrame);

      node.remove();

      loopSelection(newFrame.children);
    }
  });
};

if (!selection || selection.length === 0) {
  figma.notify("Please select a frame");
  figma.closePlugin();
} else {
  loopSelection(selection);

  figma.notify("Instances detached");
  // close the plugin
  figma.closePlugin();
}
