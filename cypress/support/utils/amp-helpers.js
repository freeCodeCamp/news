const {
  allowedAMPAttributes
} = require('../../../utils/transforms/html-sanitizer');

const stripAutoAMPAttributes = attrArr =>
  attrArr.filter(
    attr => !['class', 'style'].includes(attr) && !attr.startsWith('i-amphtml')
  );

const testAllowedAMPAttributes = (type, el) => {
  const allowedAttributes = allowedAMPAttributes[type];
  const AMPElAttributes = stripAutoAMPAttributes(el.getAttributeNames());
  const diff = AMPElAttributes.filter(
    attributes =>
      !allowedAttributes.some(allowedAttribute =>
        attributes.startsWith(
          allowedAttribute === 'data-*' ? 'data-' : allowedAttribute
        )
      )
  );

  expect(diff).to.have.length(0);
};

module.exports = {
  testAllowedAMPAttributes
};
