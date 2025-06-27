import gracefulFS from 'graceful-fs';

const { readFileSync } = gracefulFS;

export const loadJSON = filename => {
  const data = readFileSync(filename, 'utf-8');
  return JSON.parse(data);
};
