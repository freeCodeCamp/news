import { XMLToDOM } from '../../../support/utils/rss';
import commonExpectedMeta from '../../../fixtures/common-expected-meta.json';

const expected = {
  feedPath: '/tag/c-programming/rss.xml',
  channelDescription: `<![CDATA[ ${commonExpectedMeta.english.description} ]]>`,
  channelTitle: `<![CDATA[ c programming - freeCodeCamp.org ]]>`,
  channelLink: `${commonExpectedMeta.english.siteUrl}`,
  itemTitle: '<![CDATA[ The C Programming Handbook for Beginners ]]>',
  itemDescription:
    '<![CDATA[ C is one of the oldest, most widely known, and most influential programming languages. It is used in many industries because it is a highly flexible and powerful language. Learning C is a worthwhile endeavor – no matter your starting point or aspirat... ]]>',
  itemLink:
    'http://localhost:8080/news/the-c-programming-handbook-for-beginners/',
  itemGUID: '66b1e4bf0938e6258a76bbdd',
  itemCategories: [
    '<![CDATA[ beginners guide ]]>',
    '<![CDATA[ c programming ]]>',
    '<![CDATA[ handbook ]]>'
  ],
  itemCreator: '<![CDATA[ Dionysia Lemonaki ]]>',
  itemPubDate: 'Wed, 30 Aug 2023 05:38:16 +0900'
};

describe('Tag page RSS feed (Hashnode sourced)', () => {
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

      expect(channelDescription).to.equal(expected.channelDescription);
    });

    it(`should have the channel link ${expected.channelLink}}`, () => {
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

    it('should return 1 articles', () => {
      const articles = feed.querySelectorAll('item');

      expect([...articles]).to.have.lengthOf(1);
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
      // Convert both dates to milliseconds for comparison to prevent issues with
      // server time zone differences
      const pubDateMs = new Date(
        targetItem.querySelector('pubDate').innerHTML.trim()
      ).getTime();
      const expectedPubDateMs = new Date(expected.itemPubDate).getTime();

      expect(pubDateMs).to.equal(expectedPubDateMs);
    });

    it('should have a media:content element with the expected attributes', () => {
      const mediaContent = targetItem.querySelector('content');

      expect(mediaContent).to.not.be.null;
      expect(mediaContent.getAttribute('url')).to.equal(
        'https://cdn.hashnode.com/res/hashnode/image/upload/v1726039032547/73b9df27-a4f7-4ee2-81c0-d1e3db521cdb.png'
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
