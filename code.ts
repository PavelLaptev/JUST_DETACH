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

let selection = figma.currentPage.selection;
const initialSelection = figma.currentPage.selection;
const BFGFrame = figma.group(selection, figma.currentPage);
// selection.forEach((item) => {
//   let clone = item.clone();
//   BFGFrame.appendChild(clone);
// });

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

  let cloneFrame = createClone(instance);
  instance.parent.insertChild(layerIndex, cloneFrame);

  if (instance.parent.type === "INSTANCE") {
    return;
  }

  // Cloning instance children, can't move them
  instance.children.forEach((child) => {
    let childClone = child.clone();
    cloneFrame.appendChild(childClone);
    figma.currentPage.selection = [cloneFrame];
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
  let instance = BFGFrame.findAll((n) => n.type === "INSTANCE");
  console.log(instance);

  if (instance.length > 0) {
    loopSelection(BFGFrame.children);
  } else {
    BFGFrame.children.forEach((item) => {
      figma.currentPage.appendChild(item);
    });

    figma.closePlugin();
    figma.notify("🎉 DETACHED!");
    BFGFrame.remove();
  }
}, 100);

// setTimeout(() => {
//   BFGFrame.children.forEach((item) => {
//     figma.currentPage.appendChild(item);
//   });

//   figma.closePlugin();
//   figma.notify("🎉 DETACHED!");
//   BFGFrame.remove();
// }, 2000);
