import cleanCSS from 'clean-css';

export default code => {
  return new cleanCSS({}).minify(code).styles;
};
