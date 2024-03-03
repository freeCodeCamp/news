const { parse } = require('path');

const setDefaultAlt = el => {
  const filename = parse(el.src).name;

  el.setAttribute('alt', filename);
  return el;
};

module.exports = {
  setDefaultAlt
};
