export const XMLToDOM = (xml: string) => {
  const parser = new DOMParser();

  return parser.parseFromString(xml, 'application/xml');
};

module.exports = {
  XMLToDOM
};
