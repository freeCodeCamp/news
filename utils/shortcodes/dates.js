const dayjs = require('../dayjs');

const publishedDateShortcode = (dateStr) => dayjs(dateStr).format('LL');

const timeAgoShortcode = (dateStr) => dayjs().to(dayjs(dateStr));

const fullYearShortcode = () =>  dayjs(new Date).format('YYYY');

// Format dates for RSS feed
const buildDateFormatterShortcode = (timezone, dateStr) => {
  const dateObj = dateStr ? new Date(dateStr) : new Date();
  return dayjs(dateObj)
    .tz(timezone)
    .locale('en')
    .format('ddd, DD MMM YYYY HH:mm:ss ZZ');
};

const toISOStringShortcode = (dateStr) => new Date(dateStr).toISOString();

module.exports = {
  publishedDateShortcode,
  timeAgoShortcode,
  buildDateFormatterShortcode,
  fullYearShortcode,
  toISOStringShortcode
}
