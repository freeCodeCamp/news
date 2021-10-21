const { escape } = require('lodash');

// Mimic Ghost/Handlebars escaping
// raw: & < > " ' ` =
// html-escaped: &amp; &lt; &gt; &quot; &#x27; &#x60; &#x3D;
const fullEscaper = (s) =>
  escape(s)
    .replace(/&#39;/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');

module.exports = fullEscaper;
