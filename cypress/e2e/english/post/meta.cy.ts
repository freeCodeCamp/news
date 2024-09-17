const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const postExpectedMeta = {
  title:
    'How Do Numerical Conversions Work in Computer Systems? Explained With Examples',
  url: 'http://localhost:8080/news/how-do-numerical-conversions-work/',
  image: {
    url: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1715271341530/60608a00-2e63-434e-91e8-c766b171f6f7.png',
    width: 1200,
    height: 670
  },
  excerpt:
    'Computers perform complex calculations when carrying out their assigned tasks. At the very core, the calculations boil down to operations like comparisons, assignments, and addition. Have you ever wondered how they are performed under the hood and wh...'
};

describe('Post metadata (Hashnode sourced)', () => {
  context('General test cases', () => {
    beforeEach(() => {
      cy.visit('/how-do-numerical-conversions-work/');
    });

    it('<title>', () => {
      cy.title().should('eq', postExpectedMeta.title);
    });

    it('<meta> description', () => {
      cy.get('head meta[name="description"]').should(
        'have.attr',
        'content',
        postExpectedMeta.excerpt
      );
    });

    it('<link> canonical', () => {
      cy.get('head link[rel="canonical"]').should(
        'have.attr',
        'href',
        postExpectedMeta.url
      );
    });

    it('<meta> generator', () => {
      cy.get('head meta[name="generator"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.generator
      );
    });

    it('<meta> og:site_name', () => {
      cy.get('head meta[property="og:site_name"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.siteName
      );
    });

    it('<meta> og:type', () => {
      cy.get('head meta[property="og:type"]').should(
        'have.attr',
        'content',
        'article'
      );
    });

    it('<meta> og:title', () => {
      cy.get('head meta[property="og:title"]').should(
        'have.attr',
        'content',
        postExpectedMeta.title
      );
    });

    it('<meta> og:description', () => {
      cy.get('head meta[property="og:description"]').should(
        'have.attr',
        'content',
        postExpectedMeta.excerpt
      );
    });

    it('<meta> og:url', () => {
      cy.get('head meta[property="og:url"]').should(
        'have.attr',
        'content',
        postExpectedMeta.url
      );
    });

    it('<meta> og:image', () => {
      cy.get('head meta[property="og:image"]').should(
        'have.attr',
        'content',
        postExpectedMeta.image.url
      );
    });

    it('<meta> og:image:width', () => {
      cy.get('head meta[property="og:image:width"]').should(
        'have.attr',
        'content',
        postExpectedMeta.image.width
      );
    });

    it('<meta> og:image:height', () => {
      cy.get('head meta[property="og:image:height"]').should(
        'have.attr',
        'content',
        postExpectedMeta.image.height
      );
    });

    it('<meta> article:published_time', () => {
      cy.get('head meta[property="article:published_time"]').should($metaEl => {
        const publishedTimeISO = new Date(
          $metaEl.attr('content')
        ).toISOString();

        expect(publishedTimeISO).to.equal('2024-05-29T19:56:06.786Z');
      });
    });

    it('<meta> article:modified_time (for post that has been updated)', () => {
      cy.get('head meta[property="article:modified_time"]').should($metaEl => {
        const modifiedTimeISO = new Date($metaEl.attr('content')).toISOString();

        expect(modifiedTimeISO).to.equal('2024-06-14T07:15:13.058Z');
      });
    });

    // This article has two tags
    it('<meta> article:tag', () => {
      cy.get<HTMLMetaElement>('head meta[property="article:tag"]').then(
        $metaEls => {
          const tags = Array.from($metaEls).map(metaEl => metaEl.content);

          expect(tags).to.have.members(['Computers', 'data', 'MathJax']);
        }
      );
    });

    it('<meta> article:publisher', () => {
      cy.get('head meta[property="article:publisher"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.facebook.url
      );
    });

    it('<meta> twitter:card', () => {
      cy.get('head meta[name="twitter:card"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.twitter.cardType
      );
    });

    it('<meta> twitter:title', () => {
      cy.get('head meta[name="twitter:title"]').should(
        'have.attr',
        'content',
        postExpectedMeta.title
      );
    });

    it('<meta> twitter:description', () => {
      cy.get('head meta[name="twitter:description"]').should(
        'have.attr',
        'content',
        postExpectedMeta.excerpt
      );
    });

    it('<meta> twitter:url', () => {
      cy.get('head meta[name="twitter:url"]').should(
        'have.attr',
        'content',
        postExpectedMeta.url
      );
    });

    it('<meta> twitter:image', () => {
      cy.get('head meta[name="twitter:image"]').should(
        'have.attr',
        'content',
        postExpectedMeta.image.url
      );
    });

    it('<meta> twitter:label1', () => {
      cy.get('head meta[name="twitter:label1"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.twitter.label1
      );
    });

    it('<meta> twitter:data1', () => {
      cy.get('head meta[name="twitter:data1"]').should(
        'have.attr',
        'content',
        'Zaira Hira'
      );
    });

    it('<meta> twitter:label2', () => {
      cy.get('head meta[name="twitter:label2"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.twitter.label2
      );
    });

    // This article has two tags, combined into a single content string
    it('<meta> twitter:data2', () => {
      cy.get('head meta[name="twitter:data2"]').should(
        'have.attr',
        'content',
        'Computers, data, MathJax'
      );
    });

    it('<meta> twitter:site', () => {
      cy.get('head meta[name="twitter:site"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.english.twitterUsername
      );
    });

    it('<meta> twitter:creator', () => {
      cy.get('head meta[name="twitter:creator"]').should(
        'have.attr',
        'content',
        '@hira_zaira'
      );
    });
  });

  context('Other test cases', () => {
    it('<meta> article:modified_time (for post that has **not** been updated)', () => {
      cy.visit('/hashnode-no-feature-image/');

      cy.get('head meta[property="article:modified_time"]').should($metaEl => {
        const modifiedTimeISO = new Date($metaEl.attr('content')).toISOString();

        expect(modifiedTimeISO).to.equal('2024-04-16T07:41:57.015Z');
      });
    });
  });
});
