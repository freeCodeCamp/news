const fetch = require('node-fetch');
const xml2js = require('xml2js');
const { sourceApiUrl } = require('../ghost/api');
const { siteURL } = require('../../config');

const sitemapFetcherShortcode = async (page) => {
  // will need some sort of map to handle all locales
  const url =
    page === 'index'
      ? `${sourceApiUrl}/sitemap.xml`
      : `${sourceApiUrl}/sitemap-${page}.xml`;

  const ghostXml = await fetch(url)
    .then((res) => res.text())
    .then((res) => res)
    .catch((err) => console.log(err));

  const parser = new xml2js.Parser();
  const ghostXmlObj = await parser
    .parseStringPromise(ghostXml)
    .then((res) => res)
    .catch((err) => console.log(err));

  const target =
    page === 'index'
      ? ghostXmlObj.sitemapindex.sitemap
      : ghostXmlObj.urlset.url;

  const urlSwapper = (url) => url.replace(sourceApiUrl, siteURL);

  let xmlStr = target.reduce((acc, curr) => {
    const wrapper = page === 'index' ? 'sitemap' : 'url';

    acc += `
      <${wrapper}>
      <loc>${urlSwapper(curr.loc[0])}</loc>
      <lastmod>${curr.lastmod[0]}</lastmod>
      ${
        curr['image:image']
          ? `
        <image:image>
          <image:loc>${escape(
            urlSwapper(curr['image:image'][0]['image:loc'][0])
          )}</image:loc>
          <image:caption>${escape(
            curr['image:image'][0]['image:caption'][0]
          )}</image:caption>
        </image:image>`
          : ''
      }
    </${wrapper}>`;

    return acc;
  }, '');

  // xmlStr = xmlStr.replace(/\s+/g, '');

  // To do: minify xml after build
  return xmlStr;
};

module.exports = sitemapFetcherShortcode;
