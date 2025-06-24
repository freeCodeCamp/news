import dayjs from '../dayjs.js';

export const publishedDateShortcode = dateStr => dayjs(dateStr).format('LL');

export const timeAgoShortcode = dateStr => dayjs().to(dayjs(dateStr));

export const fullYearShortcode = () => dayjs(new Date()).format('YYYY');

// Format dates for RSS feed
export const buildDateFormatterShortcode = (timezone, dateStr) => {
  const dateObj = dateStr ? new Date(dateStr) : new Date();
  return dayjs(dateObj)
    .tz(timezone)
    .locale('en')
    .format('ddd, DD MMM YYYY HH:mm:ss ZZ');
};

export const toISOStringShortcode = dateStr => new Date(dateStr).toISOString();
