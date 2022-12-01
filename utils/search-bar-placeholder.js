const roundDownToNearestHundred = num => Math.floor(num / 100) * 100;
const convertToLocalizedString = (num, ISOCode) => num.toLocaleString(ISOCode); // Use commas or decimals depending on the locale

module.exports = {
  roundDownToNearestHundred,
  convertToLocalizedString
};
