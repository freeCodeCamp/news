const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const ghostPostExpectedMeta = {
  title:
    "We're Building New Courses on Rust and Python + the Replit.web Framework",
  url: 'http://localhost:8080/news/announcing-rust-course-replit-web/',
  image: {
    url: 'https://www.freecodecamp.org/news/content/images/2021/08/sean-lim-NPlv2pkYoUA-unsplash--2-.jpg',
    width: 1920,
    height: 1280
  },
  excerpt:
    "As you may know, I've been a fan of Replit since way back in 2012. I used early versions of the website when I was learning to code.  For me, Replit was a place to code my solutions for Project Euler problems, and to practice my Python and JavaScript"
};
const hashnodePostExpectedMeta = {
  title: 'Introducing freeCodeCamp Press – Free Books for Developers',
  url: 'http://localhost:8080/news/freecodecamp-press-books-handbooks/',
  image: {
    url: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1711976285627/4fb04ca0-1e79-4d9d-9737-6a986fc37324.png',
    width: 1505,
    height: 788
  },
  excerpt:
    "The freeCodeCamp community has published more than 10,000 tutorials on our publication over the years. But lately we've focused on creating even longer resources for learning math, programming, and computer science. This is why we've created freeCode..."
};

describe('Post metadata', () => {
  context('Ghost sourced post', () => {
    beforeEach(() => {
      cy.visit('/announcing-rust-course-replit-web/');
    });

    it('<title>', () => {
      cy.title().should('eq', ghostPostExpectedMeta.title);
    });

    it('<meta> description', () => {
      cy.get('head meta[name="description"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.excerpt
      );
    });

    it('<link> canonical', () => {
      cy.get('head link[rel="canonical"]').should(
        'have.attr',
        'href',
        ghostPostExpectedMeta.url
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
        ghostPostExpectedMeta.title
      );
    });

    it('<meta> og:description', () => {
      cy.get('head meta[property="og:description"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.excerpt
      );
    });

    it('<meta> og:url', () => {
      cy.get('head meta[property="og:url"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.url
      );
    });

    it('<meta> og:image', () => {
      cy.get('head meta[property="og:image"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.image.url
      );
    });

    it('<meta> og:image:width', () => {
      cy.get('head meta[property="og:image:width"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.image.width
      );
    });

    it('<meta> og:image:height', () => {
      cy.get('head meta[property="og:image:height"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.image.height
      );
    });

    it('<meta> article:published_time', () => {
      cy.get('head meta[property="article:published_time"]').should($metaEl => {
        const publishedTimeISO = new Date(
          $metaEl.attr('content')
        ).toISOString();

        expect(publishedTimeISO).to.equal('2021-08-23T17:03:24.000Z');
      });
    });

    it('<meta> article:modified_time', () => {
      cy.get('head meta[property="article:modified_time"]').should($metaEl => {
        const modifiedTimeISO = new Date($metaEl.attr('content')).toISOString();

        expect(modifiedTimeISO).to.equal('2022-02-19T13:00:03.000Z');
      });
    });

    // This article has just one tag
    it('<meta> article:tag', () => {
      cy.get('head meta[property="article:tag"]').should(
        'have.attr',
        'content',
        'freeCodeCamp'
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
        ghostPostExpectedMeta.title
      );
    });

    it('<meta> twitter:description', () => {
      cy.get('head meta[name="twitter:description"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.excerpt
      );
    });

    it('<meta> twitter:url', () => {
      cy.get('head meta[name="twitter:url"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.url
      );
    });

    it('<meta> twitter:image', () => {
      cy.get('head meta[name="twitter:image"]').should(
        'have.attr',
        'content',
        ghostPostExpectedMeta.image.url
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
        'Quincy Larson'
      );
    });

    it('<meta> twitter:label2', () => {
      cy.get('head meta[name="twitter:label2"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.twitter.label2
      );
    });

    // This article has just one tag
    it('<meta> twitter:data2', () => {
      cy.get('head meta[name="twitter:data2"]').should(
        'have.attr',
        'content',
        'freeCodeCamp'
      );
    });

    it('<meta> twitter:site', () => {
      cy.get('head meta[name="twitter:site"]').should(
        'have.attr',
        'content',
        commonExpectedMeta.twitter.username
      );
    });

    it('<meta> twitter:creator', () => {
      cy.get('head meta[name="twitter:creator"]').should(
        'have.attr',
        'content',
        '@ossia'
      );
    });
  });

  context('Hashnode sourced post', () => {
    context('General test cases', () => {
      beforeEach(() => {
        cy.visit('/freecodecamp-press-books-handbooks/');
      });

      it('<title>', () => {
        cy.title().should('eq', hashnodePostExpectedMeta.title);
      });

      it('<meta> description', () => {
        cy.get('head meta[name="description"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.excerpt
        );
      });

      it('<link> canonical', () => {
        cy.get('head link[rel="canonical"]').should(
          'have.attr',
          'href',
          hashnodePostExpectedMeta.url
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
          hashnodePostExpectedMeta.title
        );
      });

      it('<meta> og:description', () => {
        cy.get('head meta[property="og:description"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.excerpt
        );
      });

      it('<meta> og:url', () => {
        cy.get('head meta[property="og:url"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.url
        );
      });

      it('<meta> og:image', () => {
        cy.get('head meta[property="og:image"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.image.url
        );
      });

      it('<meta> og:image:width', () => {
        cy.get('head meta[property="og:image:width"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.image.width
        );
      });

      it('<meta> og:image:height', () => {
        cy.get('head meta[property="og:image:height"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.image.height
        );
      });

      it('<meta> article:published_time', () => {
        cy.get('head meta[property="article:published_time"]').should(
          $metaEl => {
            const publishedTimeISO = new Date(
              $metaEl.attr('content')
            ).toISOString();

            expect(publishedTimeISO).to.equal('2023-08-29T15:00:00.000Z');
          }
        );
      });

      it('<meta> article:modified_time (for post that has been updated)', () => {
        cy.get('head meta[property="article:modified_time"]').should(
          $metaEl => {
            const modifiedTimeISO = new Date(
              $metaEl.attr('content')
            ).toISOString();

            expect(modifiedTimeISO).to.equal('2024-04-01T12:58:13.648Z');
          }
        );
      });

      // This article has two tags
      it('<meta> article:tag', () => {
        cy.get('head meta[property="article:tag"]').then($metaEls => {
          const tags = Array.from($metaEls).map(metaEl => metaEl.content);

          expect(tags).to.have.members([
            'freeCodeCamp.org',
            'technical writing'
          ]);
        });
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
          hashnodePostExpectedMeta.title
        );
      });

      it('<meta> twitter:description', () => {
        cy.get('head meta[name="twitter:description"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.excerpt
        );
      });

      it('<meta> twitter:url', () => {
        cy.get('head meta[name="twitter:url"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.url
        );
      });

      it('<meta> twitter:image', () => {
        cy.get('head meta[name="twitter:image"]').should(
          'have.attr',
          'content',
          hashnodePostExpectedMeta.image.url
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
          'Abigail Rennemeyer'
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
          'freeCodeCamp.org, technical writing' // Note: Hashnode's freeCodeCamp tag has different text than the one on Ghost
        );
      });

      it('<meta> twitter:site', () => {
        cy.get('head meta[name="twitter:site"]').should(
          'have.attr',
          'content',
          commonExpectedMeta.twitter.username
        );
      });

      it('<meta> twitter:creator', () => {
        cy.get('head meta[name="twitter:creator"]').should(
          'have.attr',
          'content',
          '@abbeyrenn'
        );
      });
    });

    context('Other test cases', () => {
      it('<meta> article:modified_time (for post that has **not** been updated)', () => {
        cy.visit('/hashnode-no-feature-image/');

        cy.get('head meta[property="article:modified_time"]').should(
          $metaEl => {
            const modifiedTimeISO = new Date(
              $metaEl.attr('content')
            ).toISOString();

            expect(modifiedTimeISO).to.equal('2024-04-16T07:41:57.015Z');
          }
        );
      });
    });
  });
});
