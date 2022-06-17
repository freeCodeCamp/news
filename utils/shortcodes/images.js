// Note: Update this and image shortcodes once we
// sync all Ghost images to an S3 bucket
const ghostImageRe = /\/content\/images\/\d+\/\d+\//g;

// Handle images from Ghost and from third-parties
function imageShortcode(
  src,
  classes,
  alt,
  sizes,
  widths,
  dimensions,
  testLabel,
  lazyLoad
) {
  const imageUrls = src.match(ghostImageRe)
    ? widths.map(width =>
        src.replace('/content/images/', `/content/images/size/w${width}/`)
      )
    : [src];

  // data-test-label is set dynamically to post-card-image or author-profile-image
  return `
    <img
      srcset="${
        imageUrls.length === widths.length
          ? widths.map((width, i) => `${imageUrls[i]} ${width}w`).join()
          : imageUrls[0]
      }"
      sizes="${sizes.replace(/\s+/g, ' ').trim()}"
      src="${imageUrls[imageUrls.length - 1]}"
      class="${classes}"
      alt="${alt}"
      width="${dimensions.width}"
      height="${dimensions.height}"
      onerror="this.style.display='none'"
      ${lazyLoad ? 'loading="lazy"' : ''}
      data-test-label="${testLabel}"
    />
  `;
}

// Copy images over from Ghost
function featureImageShortcode(src, alt, sizes, widths, dimensions) {
  const imageUrls = src.match(ghostImageRe)
    ? widths.map(width =>
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
        alt="${alt}",
        width="${dimensions.width}"
        height="${dimensions.height}"
      >
    </picture>
  `;
}

module.exports = {
  imageShortcode,
  featureImageShortcode
};
