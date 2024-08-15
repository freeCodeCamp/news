describe('Post structured data (JSON-LD)', () => {
  const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
  const ghostPostExpectedJsonLd = {
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: 'Quincy Larson',
      image: {
        '@type': 'ImageObject',
        url: 'http://localhost:3010/content/images/2022/02/Quincy-Larson-photo.jpg',
        width: 2000,
        height: 2000
      },
      url: 'http://localhost:8080/news/author/quincylarson/',
      sameAs: ['https://www.freecodecamp.org', 'https://twitter.com/ossia']
    },
    headline:
      'We&#x27;re Building New Courses on Rust and Python + the Replit.web Framework',
    url: 'http://localhost:8080/news/announcing-rust-course-replit-web/',
    datePublished: '2021-08-23T17:03:24.000Z',
    dateModified: '2022-02-19T13:00:03.000Z',
    image: {
      '@type': 'ImageObject',
      url: 'https://www.freecodecamp.org/news/content/images/2021/08/sean-lim-NPlv2pkYoUA-unsplash--2-.jpg',
      width: 1920,
      height: 1280
    },
    keywords: 'freeCodeCamp',
    description:
      'As you may know, I&#x27;ve been a fan of Replit since way back in 2012. I used early\nversions of the website when I was learning to code. \n\nFor me, Replit was a place to code my solutions for Project Euler problems, and\nto practice my Python and JavaScript skills.\n\nOver the past decade, Replit has come a long way [https://replit.com/]. Their\nteam has evolved the coding platform into a full-blown multiplayer IDE where you\ncan collaborate with other developers, and host your apps for free.\n\nOne way a l'
  };
  const hashnodePostExpectedJsonLd = {
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: 'Abigail Rennemeyer',
      image: {
        '@type': 'ImageObject',
        url: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1579037532919/F7MLrJxZF.jpeg',
        width: 3991,
        height: 3990
      },
      url: 'http://localhost:8080/news/author/abbeyrenn/',
      sameAs: ['https://twitter.com/abbeyrenn']
    },
    headline: 'Introducing freeCodeCamp Press – Free Books for Developers',
    url: 'http://localhost:8080/news/freecodecamp-press-books-handbooks/',
    datePublished: '2023-08-29T15:00:00.000Z',
    dateModified: '2024-04-01T12:58:13.648Z',
    image: {
      '@type': 'ImageObject',
      url: 'https://cdn.hashnode.com/res/hashnode/image/upload/v1711976285627/4fb04ca0-1e79-4d9d-9737-6a986fc37324.png',
      width: 1505,
      height: 788
    },
    keywords: 'freeCodeCamp.org, technical writing',
    description:
      'The freeCodeCamp community has published more than 10,000 tutorials on our publication over the years. But lately we&#x27;ve focused on creating even longer resources for learning math, programming, and computer science.\nThis is why we&#x27;ve created freeCode...'
  };
  let jsonLdObj;

  context('Ghost sourced posts', () => {
    beforeEach(() => {
      cy.visit('/announcing-rust-course-replit-web/');

      jsonLdObj = cy
        .get('head script[type="application/ld+json"]')
        .then($script => {
          jsonLdObj = JSON.parse($script.text());
        });
    });

    it('matches the expected base values', () => {
      expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
      expect(jsonLdObj['@type']).to.equal(ghostPostExpectedJsonLd['@type']);
      expect(jsonLdObj.url).to.equal(ghostPostExpectedJsonLd.url);
      expect(jsonLdObj.datePublished).to.equal(
        ghostPostExpectedJsonLd.datePublished
      );
      expect(jsonLdObj.dateModified).to.equal(
        ghostPostExpectedJsonLd.dateModified
      );
      expect(jsonLdObj.description).to.equal(
        ghostPostExpectedJsonLd.description
      );
      expect(jsonLdObj.headline).to.equal(ghostPostExpectedJsonLd.headline);
      expect(jsonLdObj.keywords).to.equal(ghostPostExpectedJsonLd.keywords);
    });

    it('matches the expected publisher values', () => {
      expect(jsonLdObj.publisher).to.deep.equal(commonExpectedJsonLd.publisher);
    });

    it('matches the expected image values', () => {
      expect(jsonLdObj.image).to.deep.equal(ghostPostExpectedJsonLd.image);
    });

    it('matches the expected mainEntityOfPage values', () => {
      expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
        commonExpectedJsonLd.mainEntityOfPage
      );
    });

    it('matches the expected author values', () => {
      expect(jsonLdObj.author).to.deep.equal(ghostPostExpectedJsonLd.author);
    });
  });

  context('Hashnode sourced posts', () => {
    context('General test cases', () => {
      beforeEach(() => {
        cy.visit('/freecodecamp-press-books-handbooks/');

        jsonLdObj = cy
          .get('head script[type="application/ld+json"]')
          .then($script => {
            jsonLdObj = JSON.parse($script.text());
          });
      });

      it('matches the expected base values', () => {
        expect(jsonLdObj['@context']).to.equal(
          commonExpectedJsonLd['@context']
        );
        expect(jsonLdObj['@type']).to.equal(
          hashnodePostExpectedJsonLd['@type']
        );
        expect(jsonLdObj.url).to.equal(hashnodePostExpectedJsonLd.url);
        expect(jsonLdObj.datePublished).to.equal(
          hashnodePostExpectedJsonLd.datePublished
        );
        expect(jsonLdObj.dateModified).to.equal(
          hashnodePostExpectedJsonLd.dateModified
        );
        expect(jsonLdObj.description).to.equal(
          hashnodePostExpectedJsonLd.description
        );
        expect(jsonLdObj.headline).to.equal(
          hashnodePostExpectedJsonLd.headline
        );
        expect(jsonLdObj.keywords).to.equal(
          hashnodePostExpectedJsonLd.keywords
        );
      });

      it('matches the expected publisher values', () => {
        expect(jsonLdObj.publisher).to.deep.equal(
          commonExpectedJsonLd.publisher
        );
      });

      it('matches the expected image values', () => {
        expect(jsonLdObj.image).to.deep.equal(hashnodePostExpectedJsonLd.image);
      });

      it('matches the expected mainEntityOfPage values', () => {
        expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
          commonExpectedJsonLd.mainEntityOfPage
        );
      });

      it('matches the expected author values', () => {
        expect(jsonLdObj.author).to.deep.equal(
          hashnodePostExpectedJsonLd.author
        );
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
});
