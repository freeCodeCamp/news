const { parse } = require('path');
const getImageDimensions = require('../get-image-dimensions');

const setDefaultAlt = el => {
  const filename = parse(el.src).name;

  el.setAttribute('alt', filename);
  return el;
};

const setImageDimensionObj = async (targetObj, targetKey, imageUrl) => {
  // Set image_dimensions to existing object or undefined
  targetObj.image_dimensions = { ...targetObj.image_dimensions };

  const { width, height } = await getImageDimensions(imageUrl, targetObj.title);

  targetObj.image_dimensions[targetKey] = { width, height };
};

module.exports = {
  setDefaultAlt,
  setImageDimensionObj
};
