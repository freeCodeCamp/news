const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
const postExpectedJsonLd = {
  '@type': 'Article',
  author: {
    '@type': 'Person',
    name: 'Zaira Hira',
    image: {
      '@type': 'ImageObject',
      url: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1725962202907/0bebb292-8980-4c3d-8438-85114f09f6a5.png?w=500&h=500&fit=crop&crop=entropy&auto=compress,format&format=webp',
      width: 1000,
      height: 879
    },
    url: 'http://localhost:8080/news/author/zaira/',
    sameAs: ['https://x.com/hira_zaira']
  },
  headline:
    'How Do Numerical Conversions Work in Computer Systems? Explained With Examples',
  url: 'http://localhost:8080/news/how-do-numerical-conversions-work/',
  datePublished: '2024-05-29T19:56:06.786Z',
  dateModified: '2024-06-14T07:15:13.058Z',
  image: {
    '@type': 'ImageObject',
    url: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1715271341530/60608a00-2e63-434e-91e8-c766b171f6f7.png',
    width: 1200,
    height: 670
  },
  keywords: 'Computers, data, MathJax',
  description:
    'Computers perform complex calculations when carrying out their assigned tasks. At the very core, the calculations boil down to operations like comparisons, assignments, and addition.\nHave you ever wondered how they are performed under the hood and wh...'
};
let jsonLdObj;

describe('Post structured data (JSON-LD – Hashnode sourced)', () => {
  context('General test cases', () => {
    beforeEach(() => {
      cy.visit('/how-do-numerical-conversions-work/');

      jsonLdObj = cy
        .get('head script[type="application/ld+json"]')
        .then($script => {
          jsonLdObj = JSON.parse($script.text());
        });
    });

    it('matches the expected base values', () => {
      expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
      expect(jsonLdObj['@type']).to.equal(postExpectedJsonLd['@type']);
      expect(jsonLdObj.url).to.equal(postExpectedJsonLd.url);
      expect(jsonLdObj.datePublished).to.equal(
        postExpectedJsonLd.datePublished
      );
      expect(jsonLdObj.dateModified).to.equal(postExpectedJsonLd.dateModified);
      expect(jsonLdObj.description).to.equal(postExpectedJsonLd.description);
      expect(jsonLdObj.headline).to.equal(postExpectedJsonLd.headline);
      expect(jsonLdObj.keywords).to.equal(postExpectedJsonLd.keywords);
    });

    it('matches the expected publisher values', () => {
      expect(jsonLdObj.publisher).to.deep.equal(
        commonExpectedJsonLd.english.publisher
      );
    });

    it('matches the expected image values', () => {
      expect(jsonLdObj.image).to.deep.equal(postExpectedJsonLd.image);
    });

    it('matches the expected mainEntityOfPage values', () => {
      expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
        commonExpectedJsonLd.english.mainEntityOfPage
      );
    });

    it('matches the expected author values', () => {
      expect(jsonLdObj.author).to.deep.equal(postExpectedJsonLd.author);
    });
  });

  context('Other test cases', () => {
    beforeEach(() => {
      cy.visit('/hashnode-no-feature-image/');

      jsonLdObj = cy
        .get('head script[type="application/ld+json"]')
        .then($script => {
          jsonLdObj = JSON.parse($script.text());
        });
    });

    it('A post that has not been updated should not have dateModified in its structured data', () => {
      expect(jsonLdObj.datePublished).to.equal('2024-04-16T07:41:57.015Z');
      expect(jsonLdObj.dateModified).to.equal('2024-04-16T07:41:57.015Z');
    });
  });
});
