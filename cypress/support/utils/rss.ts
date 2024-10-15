const XMLToDOM = xml => {
  const parser = new DOMParser();

  return parser.parseFromString(xml, 'application/xml');
};

module.exports = {
  XMLToDOM
};
