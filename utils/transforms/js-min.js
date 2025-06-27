import { minify } from 'terser';

export default async (code, callback) => {
  try {
    const minified = await minify(code);
    callback(null, minified.code);
  } catch (err) {
    console.error('Terser error: ', err, code);
    // Fail gracefully
    callback(null, code);
  }
};
