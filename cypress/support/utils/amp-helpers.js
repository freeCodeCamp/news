const {
  allowedAMPAttributes
} = require('../../../utils/transforms/html-sanitizer');

const stripAutoAMPAttributes = attrArr =>
  attrArr.filter(
    attr => !['class', 'style'].includes(attr) && !attr.startsWith('i-amphtml')
  );

const testAllowedAMPAttributes = (type, el) => {
  const attributes = stripAutoAMPAttributes(el.getAttributeNames());
  const diff = attributes.filter(
    attr => !allowedAMPAttributes[type].includes(attr)
  );

  if (type === 'amp-ad') console.log(diff);

  expect(diff).to.have.length(0);
};

module.exports = {
  testAllowedAMPAttributes
};
