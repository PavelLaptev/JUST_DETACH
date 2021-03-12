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

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const selection = figma.currentPage.selection;

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const createClone = (source) => {
  let clone = figma.createFrame();
  clone.resize(source.width, source.height);
  clone.expanded = true;

  nodeProps.forEach((item) => {
    clone[item] = source[item];
  });

  return clone;
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const replaceAndKillInstance = (instance: FrameNode) => {
  let layerIndex = instance.parent.children.findIndex(
    (child) => child.id === instance.id
  );

  // Check if parent of the instance is not an instance
  if (instance.parent.type === "INSTANCE") {
    return;
  }

  let cloneFrame = createClone(instance);
  instance.parent.insertChild(layerIndex, cloneFrame);

  // Cloning instance children, can't move them
  instance.children.forEach((child) => {
    let childClone = child.clone();
    cloneFrame.appendChild(childClone);
  });

  instance.remove();
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const loopSelection = (selection) => {
  selection.forEach((item) => {
    if (
      (item.children && item.children.length > 0) ||
      item.type === "INSTANCE" ||
      item.type === "COMPONENT"
    ) {
      if (item.type === "INSTANCE" || item.type === "COMPONENT") {
        replaceAndKillInstance(item);
        return;
      }
      loopSelection(item.children);
      return;
    }
  });
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// loopSelection(selection);

setInterval(() => {
  let selection = figma.currentPage.selection;
  // console.log(selection);
  loopSelection(selection);
}, 100);

setTimeout(() => {
  figma.closePlugin();
  figma.notify("🎉 DETACHED!");
}, 1000);
