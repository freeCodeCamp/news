const getTwitterHandle = url => {
  return new URL(url).pathname.split('/').filter(Boolean)[0];
};

module.exports = getTwitterHandle;
