module.exports = siteLang => {
  // temporarily handle quirk with Ghost/Moment.js zh-cn not jiving
  // with i18next's expected zh-CN format and simplify for the future

  return siteLang.toLowerCase() === 'zh-cn' ? 'zh' : siteLang;
}
