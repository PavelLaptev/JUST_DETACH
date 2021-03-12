const nodeProps: string[] = [
  "name",
  "visible",
  "locked",
  "x",
  "y",
  "rotation",
  "constrainProportions",
  "layoutAlign",
  "layoutGrow",
  "opacity",
  "blendMode",
  "isMask",
  "effects",
  "effectStyleId",
  "backgrounds",
  "backgroundStyleId",
  "fills",
  "strokes",
  "strokeWeight",
  "strokeMiterLimit",
  "strokeAlign",
  "strokeCap",
  "strokeJoin",
  "dashPattern",
  "fillStyleId",
  "strokeStyleId",
  "cornerRadius",
  "cornerSmoothing",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
  "exportSettings",
  "overflowDirection",
  "numberOfFixedChildren",
  "layoutMode",
  "primaryAxisSizingMode",
  "counterAxisSizingMode",
  "primaryAxisAlignItems",
  "counterAxisAlignItems",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "itemSpacing",
  "layoutGrids",
  "gridStyleId",
  "clipsContent",
  "guides",
];

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////

const selection = figma.currentPage.selection;

const createClone = (source) => {
  let clone = figma.createFrame();
  clone.resize(source.width, source.height);
  clone.expanded = true;

  nodeProps.forEach((item) => {
    clone[item] = source[item];
  });
  // Object.assign(newClone, frame);

  // newClone.name = frame.name;
  // newClone.x = frame.x;
  // newClone.y = frame.y;
  return clone;
};

const replaceAndKillInstance = (instance: FrameNode) => {
  // Create clone frame
  let cloneFrame = createClone(instance);
  // Get layer index and append it
  let layerIndex = instance.parent.children.findIndex(
    (child) => child.id === instance.id
  );

  if (instance.parent.type === "INSTANCE") {
    return;
  }

  instance.parent.insertChild(layerIndex, cloneFrame);

  // Cloning Child, can't move it
  instance.children.forEach((child) => {
    let childClone = child.clone();
    cloneFrame.appendChild(childClone);
  });

  instance.remove();
};

const loopSelection = (selection) => {
  selection.forEach((item) => {
    if (item.children && item.children.length > 0) {
      loopSelection(item.children);
      if (item.type === "INSTANCE") {
        // console.log(item);
        replaceAndKillInstance(item);
      }
    }
  });
};

loopSelection(selection);

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();

figma.currentPage.setRelaunchData({ open: "" });
