import escape from 'lodash/escape.js';

// Mimic Ghost/Handlebars escaping
// raw: & < > " ' ` =
// html-escaped: &amp; &lt; &gt; &quot; &#x27; &#x60; &#x3D;
export const fullEscaper = s =>
  escape(s)
    .replace(/&(amp;)?#39;/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
