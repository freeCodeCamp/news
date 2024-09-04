const { decodeHTML, XMLToDOM } = require('../../../support/utils/rss');
const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const ghostAuthor = {
  expectedTitle: `Quincy Larson - ${commonExpectedMeta.siteName}`,
  feedPath: '/author/quincylarson/rss.xml'
};
const hashnodeAuthor = {
  expectedTitle: `Abigail Rennemeyer - ${commonExpectedMeta.siteName}`,
  feedPath: '/author/abbeyrenn/rss.xml'
};

describe('Author page RSS feed', () => {
  context('Ghost sourced author feeds', () => {
    it('should start with a UTF-8 encoding declaration', () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
        expect(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).to
          .be.true;
      });
    });

    it('should have the channel title <![CDATA[ Quincy Larson - freeCodeCamp.org ]]>', () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const channelTitle = feed
          .querySelector('channel title')
          .innerHTML.trim();

        expect(channelTitle).to.equal(
          `<![CDATA[ ${ghostAuthor.expectedTitle} ]]>`
        );
      });
    });

    it(`should have the channel description <![CDATA[ ${commonExpectedMeta.description} ]]>`, () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
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
      cy.request(ghostAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const channelLink = feed.querySelector('channel link').innerHTML.trim();

        expect(channelLink).to.equal(`${commonExpectedMeta.siteUrl}`);
      });
    });

    it('should have the expected channel image elements and values', () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
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
        expect(channelImageTitle).to.equal(ghostAuthor.expectedTitle);
        expect(channelImageLink).to.equal(commonExpectedMeta.siteUrl);
      });
    });

    it("should have a channel lastBuildDate that's less than or equal to the current date", () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const lastBuildDate = new Date(
          feed.querySelector('channel lastBuildDate').innerHTML.trim()
        );
        const currDate = new Date();

        expect(lastBuildDate).to.be.lte(currDate);
      });
    });

    it('should have a channel ttl set to 60', () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const channelTTL = feed.querySelector('channel ttl').innerHTML.trim();

        expect(channelTTL).to.equal('60');
      });
    });

    it('should return 15 articles', () => {
      cy.request(ghostAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const articles = feed.querySelectorAll('item');

        expect([...articles]).to.have.lengthOf(15);
      });
    });
  });

  context('Hashnode sourced author feeds', () => {
    it('should start with a UTF-8 encoding declaration', () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
        expect(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).to
          .be.true;
      });
    });

    it('should have the channel title <![CDATA[ Quincy Larson - freeCodeCamp.org ]]>', () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const channelTitle = feed
          .querySelector('channel title')
          .innerHTML.trim();

        expect(channelTitle).to.equal(
          `<![CDATA[ ${hashnodeAuthor.expectedTitle} ]]>`
        );
      });
    });

    it(`should have the channel description <![CDATA[ ${commonExpectedMeta.description} ]]>`, () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
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
      cy.request(hashnodeAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const channelLink = feed.querySelector('channel link').innerHTML.trim();

        expect(channelLink).to.equal(`${commonExpectedMeta.siteUrl}`);
      });
    });

    it('should have the expected channel image elements and values', () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
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
        expect(channelImageTitle).to.equal(hashnodeAuthor.expectedTitle);
        expect(channelImageLink).to.equal(commonExpectedMeta.siteUrl);
      });
    });

    it("should have a channel lastBuildDate that's less than or equal to the current date", () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const lastBuildDate = new Date(
          feed.querySelector('channel lastBuildDate').innerHTML.trim()
        );
        const currDate = new Date();

        expect(lastBuildDate).to.be.lte(currDate);
      });
    });

    it('should have a channel ttl set to 60', () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const channelTTL = feed.querySelector('channel ttl').innerHTML.trim();

        expect(channelTTL).to.equal('60');
      });
    });

    it('should return 1 article', () => {
      cy.request(hashnodeAuthor.feedPath).then(async res => {
        const feed = XMLToDOM(res.body);
        const articles = feed.querySelectorAll('item');

        expect([...articles]).to.have.lengthOf(1);
      });
    });
  });
});
