const { XMLToDOM } = require('../../../support/utils/rss');
const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');

const expected = {
  feedPath: '/author/rafael/rss.xml',
  channelDescription: `<![CDATA[ ${commonExpectedMeta.espanol.description} ]]>`,
  channelTitle: `<![CDATA[ Rafael D. Hernandez - freeCodeCamp.org ]]>`,
  channelLink: `${commonExpectedMeta.espanol.siteUrl}`,
  itemTitle:
    '<![CDATA[ El Desafío #100DaysOfCode, su historia y por qué debes hacerlo para el 2021 ]]>',
  itemDescription:
    '<![CDATA[ En junio de 2016, recibí un correo electrónico de un desarrollador llamado Alexander Callaway. Conocía a Alex porque había creado el grupo de estudio FreeCodeCamp Toronto. Fue uno de los grupos de estudio más activos de Canadá, atrayendo multitudes de desarrolladores cada semana. Pero Alex no me escribía sobre el ]]>',
  itemLink:
    'http://localhost:8080/espanol/news/el-desafio-100daysofcode-su-historia-y-por-que-debes-probarlo-para-2022/',
  itemGUID: '6210e49803710d00015803a8',
  itemCategories: ['<![CDATA[ 100daysofcode ]]>'],
  itemCreator: '<![CDATA[ Rafael D. Hernandez ]]>',
  itemPubDate: 'Mon, 17 Jan 2022 07:46:14 +0900'
};

describe('Author page RSS feed (Ghost sourced)', () => {
  let resBody: string;
  let feed: {
    querySelector: (arg0: string) => {
      (): any;
      new (): any;
      innerHTML: string;
    };
    querySelectorAll: (arg0: string) => any;
  };

  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');

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

    it('should return 15 articles', () => {
      const articles = feed.querySelectorAll('item');

      expect([...articles]).to.have.lengthOf(15);
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
        'https://www.freecodecamp.org/espanol/news/content/images/2022/01/5f9c9afc740569d1a4ca2907.jpeg'
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
