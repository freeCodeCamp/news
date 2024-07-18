const shortenExcerpt = (str, maxLength = 50) => {
  return str.replace(/\n+/g, ' ').split(' ').slice(0, maxLength).join(' ');
};

module.exports = shortenExcerpt;
