const i18next = require('../config/i18n/config');

function translate(key, data) {
  return i18next.t(key, { ...data });
}

module.exports = translate;
