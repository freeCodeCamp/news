const { decodeHTML, XMLToDOM } = require('../../../support/utils/rss');
const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const expectedAuthorTitle = `Quincy Larson - ${commonExpectedMeta.siteName}`;
const feedPath = '/author/quincylarson/rss.xml';

describe('Author page RSS feed', () => {
  it('should start with a UTF-8 encoding declaration', () => {
    cy.request(feedPath).then(async res => {
      expect(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).to
        .be.true;
    });
  });

  it('should have the channel title <![CDATA[ Quincy Larson - freeCodeCamp.org ]]>', () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const channelTitle = feed.querySelector('channel title').innerHTML.trim();

      expect(channelTitle).to.equal(`<![CDATA[ ${expectedAuthorTitle} ]]>`);
    });
  });

  it(`should have the channel description <![CDATA[ ${commonExpectedMeta.description} ]]>`, () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const channelDescription = feed
        .querySelector('channel description')
        .innerHTML.trim();

      expect(channelDescription).to.equal(
        `<![CDATA[ ${commonExpectedMeta.description} ]]>`
      );
    });
  });

  it('should have the channel link http://localhost:8080/news/', () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const channelLink = feed.querySelector('channel link').innerHTML.trim();

      expect(channelLink).to.equal(`${commonExpectedMeta.siteUrl}`);
    });
  });

  it('should have the expected channel image elements and values', () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const channelImageURL = feed
        .querySelector('channel image url')
        .innerHTML.trim();
      const channelImageTitle = decodeHTML(
        feed.querySelector('channel image title').innerHTML.trim()
      );
      const channelImageLink = feed
        .querySelector('channel image link')
        .innerHTML.trim();

      expect(channelImageURL).to.equal(commonExpectedMeta.favicon.png);
      expect(channelImageTitle).to.equal(expectedAuthorTitle);
      expect(channelImageLink).to.equal(commonExpectedMeta.siteUrl);
    });
  });

  it("should have a channel lastBuildDate that's less than or equal to the current date", () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const lastBuildDate = new Date(
        feed.querySelector('channel lastBuildDate').innerHTML.trim()
      );
      const currDate = new Date();

      expect(lastBuildDate).to.be.lte(currDate);
    });
  });

  it('should have a channel ttl set to 60', () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const channelTTL = feed.querySelector('channel ttl').innerHTML.trim();

      expect(channelTTL).to.equal('60');
    });
  });

  it('should return 15 articles', () => {
    cy.request(feedPath).then(async res => {
      const feed = XMLToDOM(res.body);
      const articles = feed.querySelectorAll('item');

      expect([...articles]).to.have.lengthOf(15);
    });
  });
});
