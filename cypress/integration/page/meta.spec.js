const metaContent = {
  title: "Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.",
  url: 'http://localhost:8080/news/thank-you-for-donating/',
  image: 'https://www.freecodecamp.org/news/content/images/2020/03/fcc-banner.jpg',
  excerpt: "Once you've forwarded this receipt, we will award you with your donor badge on your freeCodeCamp profile. We will also turn off donation prompts for you. Thank you again for supporting our nonprofit. freeCodeCamp is a highly-efficient education NGO. This year alone, we've provided million hours of free education to"
}

describe('Page metadata', () => {
  before(() => {
    cy.visit('/thank-you-for-donating');
  });

  it('<title>', () => {
    cy.title().should(
      'eq',
      metaContent.title
    );
  });

  it('<meta> description', () => {
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      metaContent.excerpt
    );
  });

  it('canonical URL', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      metaContent.url
    );
  });

  it('<meta> generator', () => {
    cy.get('head meta[name="generator"]').should(
      'have.attr',
      'content',
      'Eleventy'
    );
  });

  it('<meta> og:site_name', () => {
    cy.get('head meta[property="og:site_name"]').should(
      'have.attr',
      'content',
      'freeCodeCamp.org'
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
      metaContent.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      metaContent.excerpt
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      metaContent.url
    );
  });

  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      metaContent.image
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      1500
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      500
    );
  });

  it('<meta> article:published_time', () => {
    cy.get('head meta[property="article:published_time"]').should(($metaEl) => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2020-03-16T17:03:46.000Z');
    });
  });

  it('<meta> article:modified_time', () => {
    cy.get('head meta[property="article:modified_time"]').should(($metaEl) => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2021-11-18T09:16:21.000Z');
    });
  });

  it('<meta> article:publisher', () => {
    cy.get('head meta[property="article:publisher"]').should(
      'have.attr',
      'content',
      'https://www.facebook.com/freecodecamp'
    );
  });

  it('<meta> twitter:card', () => {
    cy.get('head meta[name="twitter:card"]').should(
      'have.attr',
      'content',
      'summary_large_image'
    );
  });

  it('<meta> twitter:title', () => {
    cy.get('head meta[name="twitter:title"]').should(
      'have.attr',
      'content',
      metaContent.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      metaContent.excerpt
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      metaContent.url
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      metaContent.image
    );
  });

  it('<meta> twitter:label1', () => {
    cy.get('head meta[name="twitter:label1"]').should(
      'have.attr',
      'content',
      'Written by'
    );
  });

  it('<meta> twitter:data1', () => {
    cy.get('head meta[name="twitter:data1"]').should(
      'have.attr',
      'content',
      'freeCodeCamp.org'
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      '@freecodecamp'
    );
  });
});
