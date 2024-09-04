const XMLToDOM = xml => {
  const parser = new DOMParser();

  return parser.parseFromString(xml, 'application/xml');
};

const decodeHTML = str => {
  const doc = new DOMParser().parseFromString(str, 'text/html');

  return doc.documentElement.textContent;
};

module.exports = {
  XMLToDOM,
  decodeHTML
};
