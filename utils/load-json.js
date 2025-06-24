import { readFileSync } from 'fs';

export const loadJSON = filename => {
  const data = readFileSync(filename, 'utf-8');
  return JSON.parse(data);
};
