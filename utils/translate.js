import i18next from '../config/i18n/config.js';

export const translate = (key, data) => {
  return i18next.t(key, { ...data });
};
