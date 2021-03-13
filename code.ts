////////////////////////////////////////////////////////////
////////////////////// PROPS TO COPY ///////////////////////
////////////////////////////////////////////////////////////

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
/////////////////////// INITIAL VARS ////////////////////////
/////////////////////////////////////////////////////////////
const initialSelection = figma.currentPage.selection;

const initialItem = {
  order: initialSelection.map((item) => {
    return item.parent.children.indexOf(item);
  }),
  parent: initialSelection.map((item) => {
    return item.parent;
  }),
  pos: {
    x: initialSelection.map((item) => {
      return item.x;
    }),
    y: initialSelection.map((item) => {
      return item.y;
    }),
  },
};

let selection = figma.currentPage.selection;
const BFGGroup = figma.group(selection, figma.currentPage);

//////////////////////////////////////////////////////////////
/////////////////////////// CLONE ////////////////////////////
//////////////////////////////////////////////////////////////

const createClone = (source) => {
  let clone = figma.createFrame();
  clone.resize(source.width, source.height);
  clone.expanded = true;

  nodeProps.forEach((item) => {
    clone[item] = source[item];
  });

  return clone;
};

//////////////////////////////////////////////////////////////
////////////////////// CLONE AND KILL ////////////////////////
//////////////////////////////////////////////////////////////

const replaceAndKillInstance = (instance: FrameNode) => {
  let layerIndex = instance.parent.children.findIndex(
    (child) => child.id === instance.id
  );

  let cloneFrame = createClone(instance);
  instance.parent.insertChild(layerIndex, cloneFrame);

  if (instance.parent.type === "INSTANCE") {
    return;
  }

  // Cloning instance children, can't move them
  instance.children.forEach((child) => {
    let childClone = child.clone();
    cloneFrame.appendChild(childClone);
    // Important to select to continue the loop
    // figma.currentPage.selection = [cloneFrame];
  });

  instance.remove();
};

//////////////////////////////////////////////////////////////
//////////////////////// MAIN LOOP ///////////////////////////
//////////////////////////////////////////////////////////////

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
//////// CONTINUE WHILE INSTANCES OR MASTERS EXIST //////////
/////////////////////////////////////////////////////////////

setInterval(() => {
  // Check if there any instances or masters to finish the loop
  let leftoverInstances = BFGGroup.findAll((n) => n.type === "INSTANCE");
  let leftoverMasters = BFGGroup.findAll((n) => n.type === "COMPONENT");

  if (leftoverInstances.length > 0 || leftoverMasters.length > 0) {
    loopSelection(BFGGroup.children);
  } else {
    BFGGroup.children.forEach((item, i) => {
      initialItem.parent[i].appendChild(item);
    });

    figma.closePlugin();
    figma.notify("🎉 DETACHED!");
  }
}, 100);
