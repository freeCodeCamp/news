// Note: Update this and image shortcodes once we
// sync all Ghost images to an S3 bucket
const ghostImageRe = /\/content\/images\/\d+\/\d+\//g;

// Handle images from Ghost and from third-parties
function imageShortcode(src, cls, alt, sizes, widths, index) {
const imageUrls = src.match(ghostImageRe)
  ? widths.map((width) =>
      src.replace('/content/images/', `/content/images/size/w${width}/`)
    )
  : [src];

return `
  <img
    ${index === 0 ? `rel="preload" as="image"` : ''}
    ${cls.includes('lazyload') && index > 0 ? 'data-srcset' : 'srcset'}="${
  imageUrls.length === widths.length
    ? widths.map((width, i) => `${imageUrls[i]} ${width}w`).join()
    : imageUrls[0]
}"
    sizes="${sizes.replace(/\s+/g, ' ').trim()}"
    ${cls.includes('lazyload') && index > 0 ? 'data-src' : 'src'}="${
  imageUrls[imageUrls.length - 1]
}"
    class="${index === 0 ? cls.replace('lazyload', '') : cls}"
    alt="${alt}"
    onerror="this.style.display='none'"
  />
`;
}

// Copy images over from Ghost
function featureImageShortcode(src, alt, sizes, widths) {
  const imageUrls = src.match(ghostImageRe)
    ? widths.map((width) =>
        src.replace('/content/images/', `/content/images/size/w${width}/`)
      )
    : [src];

  return `
    <picture>
      <source
        media="(max-width: 700px)"
        sizes="1px"
        srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 1w"
      />
      <source 
        media="(min-width: 701px)"
        sizes="${sizes.replace(/\s+/g, ' ').trim()}"
        srcset="${
          imageUrls.length === widths.length
            ? widths.map((width, i) => `${imageUrls[i]} ${width}w`).join()
            : imageUrls[0]
        }"
      />
      <img
        onerror="this.style.display='none'"
        src="${imageUrls[imageUrls.length - 1]}"
        alt="${alt}"
      >
    </picture>
  `;
}

module.exports = {
  imageShortcode,
  featureImageShortcode
}
