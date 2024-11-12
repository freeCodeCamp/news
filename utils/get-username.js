// Currently used to get X / Twitter and Facebook useranmes from URLs
const getUsername = url => {
  return new URL(url).pathname.split('/').filter(Boolean)[0];
};

module.exports = getUsername;
