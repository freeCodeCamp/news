import commonExpectedJsonLd from '../../../fixtures/common-expected-json-ld.json';
const pageExpectedJsonLd = {
  '@type': 'Article',
  headline: 'Thank You for Being a Supporter',
  url: 'http://localhost:8080/news/thank-you-for-being-a-supporter/',
  image: {
    '@type': 'ImageObject',
    url: 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png',
    width: 1920,
    height: 1080
  },
  description:
    'freeCodeCamp is a highly-efficient education NGO. This year alone, we&#x27;ve provided million hours of free education to people around the world. At our charity&#x27;s current operating budget, every dollar you donate to freeCodeCamp translates into 50 hours worth of technology education. When you donate to freeCodeCamp, you help people learn'
};
let jsonLdObj;

describe('Page structured data (JSON-LD – Hashnode sourced)', () => {
  beforeEach(() => {
    cy.visit('/thank-you-for-being-a-supporter/');

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then($script => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
    expect(jsonLdObj['@type']).to.equal(pageExpectedJsonLd['@type']);
    expect(jsonLdObj.url).to.equal(pageExpectedJsonLd.url);
    expect(jsonLdObj.description).to.equal(pageExpectedJsonLd.description);
    expect(jsonLdObj.headline).to.equal(pageExpectedJsonLd.headline);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(
      commonExpectedJsonLd.english.publisher
    );
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(pageExpectedJsonLd.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.english.mainEntityOfPage
    );
  });

  // Note: Hashnode sourced pages don't include an author, or published/modified dates,
  // so those tests are omitted
});
