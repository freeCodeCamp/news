const { XMLToDOM } = require('../../../support/utils/rss');
const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');

const expected = {
  channelDescription: `<![CDATA[ ${commonExpectedMeta.english.description} ]]>`,
  channelTitle: `<![CDATA[ Abigail Rennemeyer - ${commonExpectedMeta.siteName} ]]>`,
  channelLink: `${commonExpectedMeta.english.siteUrl}`,
  feedPath: '/author/abbeyrenn/rss.xml',
  itemTitle:
    '<![CDATA[ Introducing freeCodeCamp Press – Free Books for Developers ]]>',
  itemDescription:
    "<![CDATA[ The freeCodeCamp community has published more than 10,000 tutorials on our publication over the years. But lately we've focused on creating even longer resources for learning math, programming, and computer science. This is why we've created freeCode... ]]>",
  itemLink: 'http://localhost:8080/news/freecodecamp-press-books-handbooks/',
  itemGUID: '66b1fa1ceea9870582e16bca',
  itemCreator: '<![CDATA[ Abigail Rennemeyer ]]>',
  itemPubDate: 'Thu, 31 Aug 2023 01:49:54 +0900',
  itemCategories: [
    '<![CDATA[ freeCodeCamp.org ]]>',
    '<![CDATA[ technical writing ]]>'
  ]
};

describe('Author page RSS feed (Hashnode sourced)', () => {
  let resBody;
  let feed;

  before(() => {
    cy.request(expected.feedPath).then(async res => {
      resBody = res.body;
      feed = XMLToDOM(resBody);
    });
  });

  describe('Channel elements', () => {
    it('should start with a UTF-8 encoding declaration', () => {
      expect(resBody.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).to.be
        .true;
    });

    it(`should have the channel title ${expected.channelTitle}`, () => {
      const channelTitle = feed.querySelector('channel title').innerHTML.trim();

      expect(channelTitle).to.equal(expected.channelTitle);
    });

    it(`should have the channel description ${expected.channelDescription}`, () => {
      const channelDescription = feed
        .querySelector('channel description')
        .innerHTML.trim();

      expect(channelDescription).to.equal(channelDescription);
    });

    it(`should have the channel link ${expected.channelLink}`, () => {
      const channelLink = feed.querySelector('channel link').innerHTML.trim();

      expect(channelLink).to.equal(expected.channelLink);
    });

    it('should have the expected channel image elements and values', () => {
      const channelImageURL = feed
        .querySelector('channel image url')
        .innerHTML.trim();
      const channelImageTitle = feed
        .querySelector('channel image title')
        .innerHTML.trim();
      const channelImageLink = feed
        .querySelector('channel image link')
        .innerHTML.trim();

      expect(channelImageURL).to.equal(commonExpectedMeta.favicon.png);
      expect(channelImageTitle).to.equal(expected.channelTitle);
      expect(channelImageLink).to.equal(expected.channelLink);
    });

    it("should have a channel lastBuildDate that's less than or equal to the current date", () => {
      const lastBuildDate = new Date(
        feed.querySelector('channel lastBuildDate').innerHTML.trim()
      );
      const currDate = new Date();

      expect(lastBuildDate).to.be.lte(currDate);
    });

    it('should have a channel ttl set to 60', () => {
      const channelTTL = feed.querySelector('channel ttl').innerHTML.trim();

      expect(channelTTL).to.equal('60');
    });

    it('should return 1 item / post', () => {
      const items = feed.querySelectorAll('item');

      expect([...items]).to.have.lengthOf(1);
    });
  });

  describe('Item elements', () => {
    // Note: We just test the target item in the feed, which may need to
    // be updated depending on the number of test articles that get added
    // in the future
    let targetItem;

    before(() => {
      targetItem = [...feed.querySelectorAll('item')]
        .filter(item => {
          const guid = item.querySelector('guid').innerHTML.trim();

          return guid === expected.itemGUID;
        })
        .pop();
    });

    it(`should have the title ${expected.itemTitle}`, () => {
      const title = targetItem.querySelector('title').innerHTML.trim();

      expect(title).to.equal(expected.itemTitle);
    });

    it(`should have the description ${expected.itemDescription}`, () => {
      const description = targetItem
        .querySelector('description')
        .innerHTML.trim();

      expect(description).to.equal(expected.itemDescription);
    });

    it(`should have the link ${expected.itemLink}`, () => {
      const link = targetItem.querySelector('link').innerHTML.trim();

      expect(link).to.equal(expected.itemLink);
    });

    it(`should have the guid ${expected.itemGUID}`, () => {
      const guid = targetItem.querySelector('guid').innerHTML.trim();

      expect(guid).to.equal(expected.itemGUID);
    });

    it('should have the expected categories (tags)', () => {
      const categories = [...targetItem.querySelectorAll('category')].map(
        category => category.innerHTML.trim()
      );

      categories.forEach((category, i) =>
        expect(category).to.equal(expected.itemCategories[i])
      );
    });

    it(`should have the dc:creator ${expected.itemCreator}`, () => {
      const creator = targetItem.querySelector('creator').innerHTML.trim();

      expect(creator).to.equal(expected.itemCreator);
    });

    it(`should have the pubDate ${expected.itemPubDate}`, () => {
      const pubDate = targetItem.querySelector('pubDate').innerHTML.trim();

      expect(pubDate).to.equal(expected.itemPubDate);
    });

    it('should have a media:content element with the expected attributes', () => {
      const mediaContent = targetItem.querySelector('content');

      expect(mediaContent).to.not.be.null;
      expect(mediaContent.getAttribute('url')).to.equal(
        'https://www.freecodecamp.org/news/content/images/2023/08/freeCodeCamp-Press.png'
      );
      expect(mediaContent.getAttribute('medium')).to.equal('image');
    });

    it(`should have a non-empty content:encoded field`, () => {
      const contentEncoded = targetItem
        .querySelector('encoded')
        .innerHTML.replace(/<!\[CDATA\[/, '')
        .replace(/\]\]>/, '')
        .trim();

      expect(contentEncoded).to.not.equal('undefined');
      expect(contentEncoded).to.not.equal('');
    });
  });
});
