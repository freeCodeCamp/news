const {
  allowedAMPAttributes
} = require('../../../../utils/transforms/html-sanitizer');

const selectors = {
  siteLogo: '.logo > .i-amphtml-element',
  images: {
    cats: ':nth-child(3) > .i-amphtml-element',
    catsWithCaption: ':nth-child(5) > .i-amphtml-element',
    smallIcon: ':nth-child(7) > .i-amphtml-element'
  },
  gifs: {
    typingCat: ':nth-child(10) > .i-amphtml-element',
    typingCatWithCaption: ':nth-child(12) > .i-amphtml-element'
  },
  youtube: ':nth-child(15) > .i-amphtml-element',
  iframes: {
    giphy: '[src="https://giphy.com/embed/VbnUQpnihPSIgIXuZv"]',
    codePen: ':nth-child(21) > .i-amphtml-element'
  },
  videos: {
    bigBuckBunny: 'amp-video:nth-child(24)',
    bigBuckBunnyWithSourceEl: 'amp-video:nth-child(26)'
  },
  audio: {
    rideOfTheValkyries: 'amp-audio:nth-child(29)',
    rideOfTheValkyriesWithSourceEl: 'amp-audio:nth-child(31)'
  }
};

const stripAutoAMPAttributes = attrArr =>
  attrArr.filter(
    attr => !['class', 'style'].includes(attr) && !attr.startsWith('i-amphtml')
  );

describe('AMP page', () => {
  before(() => {
    cy.visit('/amp-page-tests/amp');
  });

  it('should render', () => {
    cy.get('h1').contains('AMP Page Tests');
  });

  it('should not show a feature image', () => {
    cy.get('figure.post-image amp-img').should('not.exist');
  });

  context('<amp-img>', () => {
    it('should render the site logo as an amp-img', () => {
      cy.get(selectors.siteLogo).then($el => {
        expect($el[0].tagName).to.equal('AMP-IMG');
      });
    });

    it('the first image of cats should have the expected attributes and values', () => {
      cy.get(selectors.images.cats).then($el => {
        expect($el.attr('width')).to.equal('400');
        expect($el.attr('height')).to.equal('222');
        expect($el.attr('alt')).to.equal('cats');
        expect($el.attr('layout')).to.equal('responsive');
      });
    });

    it('the first image of cats should only contain allowed amp-img attributes', () => {
      cy.get(selectors.images.cats).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-img'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });

    it('the second image of cats should have a figcaption with the expected text', () => {
      cy.get(selectors.images.catsWithCaption)
        .get('figcaption')
        .contains('Cats in a field');
    });

    it('the small fCC icon should have a `layout` attribute with the value `fixed`', () => {
      cy.get(selectors.images.smallIcon).then($el => {
        expect($el.attr('layout')).to.equal('fixed');
      });
    });
  });

  context('<amp-anim>', () => {
    it('the first typing cat gif should have the expected attributes and values', () => {
      cy.get(selectors.gifs.typingCat).then($el => {
        expect($el.attr('width')).to.equal('340');
        expect($el.attr('height')).to.equal('340');
        expect($el.attr('alt')).to.equal('cat-typing');
        expect($el.attr('layout')).to.equal('responsive');
      });
    });

    it('the first typing cat gif should only contain allowed amp-anim attributes', () => {
      cy.get(selectors.gifs.typingCat).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-anim'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });

    it('the second typing cat gif should have a figcaption with the expected text', () => {
      cy.get(selectors.gifs.typingCatWithCaption)
        .get('figcaption')
        .contains('Tap tap tappity tap');
    });
  });

  context('<amp-youtube>', () => {
    it('should have the expected attributes and values', () => {
      cy.get(selectors.youtube).then($el => {
        expect($el.attr('width')).to.equal('200');
        expect($el.attr('height')).to.equal('113');
        expect($el.attr('layout')).to.equal('responsive');
        expect($el.attr('data-videoid')).to.equal('8TDsGUFFXSY');
      });
    });

    it('should only contain allowed amp-youtube attributes', () => {
      cy.get(selectors.youtube).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-youtube'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });
  });

  context('<amp-iframe>', () => {
    it('the GIPHY iframe should have the expected attributes and values', () => {
      cy.get(selectors.iframes.giphy).then($el => {
        expect($el.attr('width')).to.equal('384');
        expect($el.attr('height')).to.equal('480');
        expect($el.attr('frameborder')).to.equal('0');
      });
    });

    it('the GIPHY iframe should only contain allowed amp-iframe attributes', () => {
      cy.get(selectors.iframes.giphy).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-iframe'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });

    it('the CodePen iframe should have the expected attributes and values', () => {
      cy.get(selectors.iframes.codePen).then($el => {
        expect($el.attr('width')).to.equal('600'); // This is added as a default in amp-handler.js
        expect($el.attr('height')).to.equal('300');
        expect($el.attr('src')).to.include(
          'https://codepen.io/freeCodeCamp/embed/preview/VPaoNP'
        );
        expect($el.attr('layout')).to.equal('responsive');
        expect($el.attr('frameborder')).to.equal('0');
      });
    });

    it('the CodePen iframe should only contain allowed amp-iframe attributes', () => {
      cy.get(selectors.iframes.codePen).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-iframe'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });
  });

  context('<amp-video>', () => {
    it('the first video should have the expected attributes and values', () => {
      cy.get(selectors.videos.bigBuckBunny).then($el => {
        expect($el.attr('width')).to.equal('720');
        expect($el.attr('height')).to.equal('405');
        expect($el.attr('src')).to.equal(
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        );
        expect($el.attr('poster')).to.equal(
          'https://peach.blender.org/wp-content/uploads/bbb-splash.png'
        );
        expect($el.attr('controls')).to.exist;
        expect($el.attr('layout')).to.equal('responsive');
      });
    });

    it('the first video should only contain allowed amp-video attributes', () => {
      cy.get(selectors.videos.bigBuckBunny).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-video'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });

    it('the second video should have a child `source` element and no `src` attribute', () => {
      cy.get(selectors.videos.bigBuckBunnyWithSourceEl).then($el => {
        expect($el.attr('src')).to.not.exist;
      });

      cy.get(`${selectors.videos.bigBuckBunnyWithSourceEl} source`).then(
        $el => {
          expect($el.attr('src')).to.equal(
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          );
        }
      );
    });
  });

  context('<amp-audio>', () => {
    it('the first audio element should have the expected attributes and values', () => {
      cy.get(selectors.audio.rideOfTheValkyries).then($el => {
        expect($el.attr('src')).to.equal(
          'https://ia801402.us.archive.org/16/items/EDIS-SRP-0197-06/EDIS-SRP-0197-06.mp3'
        );
        expect($el.attr('controls')).to.exist;
      });
    });

    it('the first audio element should only contain allowed amp-audio attributes', () => {
      cy.get(selectors.audio.rideOfTheValkyries).then($el => {
        const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
        const diff = attributes.filter(
          attr => !allowedAMPAttributes['amp-audio'].includes(attr)
        );

        expect(diff).to.have.length(0);
      });
    });

    it('the second audio element should have a child `source` element and no `src` attribute', () => {
      cy.get(selectors.audio.rideOfTheValkyriesWithSourceEl).then($el => {
        expect($el.attr('src')).to.not.exist;
      });

      cy.get(`${selectors.audio.rideOfTheValkyriesWithSourceEl} source`).then(
        $el => {
          expect($el.attr('src')).to.equal(
            'https://ia801402.us.archive.org/16/items/EDIS-SRP-0197-06/EDIS-SRP-0197-06.mp3'
          );
        }
      );
    });
  });
});
