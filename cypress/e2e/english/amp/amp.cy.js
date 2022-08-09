const {
  allowedAMPAttributes
} = require('../../../../utils/transforms/html-sanitizer');

const selectors = {
  images: {
    siteLogo: '.logo > .i-amphtml-element',
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
    bigBuckBunnyWithSourceEl: 'amp-video:nth-child(26)',
    bigBuckBunnyWithBooleanAttributes: 'amp-video:nth-child(28)'
  },
  audio: {
    rideOfTheValkyries: 'amp-audio:nth-child(31)',
    rideOfTheValkyriesWithSourceEl: 'amp-audio:nth-child(33)',
    rideOfTheValkyriesWithBooleanAttributes: 'amp-audio:nth-child(35)'
  }
};

const stripAutoAMPAttributes = attrArr =>
  attrArr.filter(
    attr => !['class', 'style'].includes(attr) && !attr.startsWith('i-amphtml')
  );

const testAllowedAttributes = (type, selector) => {
  cy.get(selector).then($el => {
    const attributes = stripAutoAMPAttributes($el[0].getAttributeNames());
    const diff = attributes.filter(
      attr => !allowedAMPAttributes[type].includes(attr)
    );

    expect(diff).to.have.length(0);
  });
};

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
      cy.get(selectors.images.siteLogo).then($el => {
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

    it('all amp-img elements should only contain the allowed attributes', () => {
      const AMPImgSelectors = [...Object.values(selectors.images)];

      AMPImgSelectors.forEach(selector =>
        testAllowedAttributes('amp-img', selector)
      );
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

    it('the second typing cat gif should have a figcaption with the expected text', () => {
      cy.get(selectors.gifs.typingCatWithCaption)
        .get('figcaption')
        .contains('Tap tap tappity tap');
    });

    it('all amp-anim elements should only contain the allowed attributes', () => {
      const AMPAnimSelectors = [...Object.values(selectors.gifs)];

      AMPAnimSelectors.forEach(selector =>
        testAllowedAttributes('amp-anim', selector)
      );
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

    it('the amp-youtube element should only contain the allowed attributes', () => {
      testAllowedAttributes('amp-youtube', selectors.youtube);
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

    it('all amp-iframe elements should only contain the allowed attributes', () => {
      const AMPIframeSelectors = [...Object.values(selectors.iframes)];

      AMPIframeSelectors.forEach(selector =>
        testAllowedAttributes('amp-iframe', selector)
      );
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

    it('the third video should have the `loop` and `autoplay` boolean attributes without any values', () => {
      cy.get(selectors.videos.bigBuckBunnyWithBooleanAttributes).then($el => {
        expect($el.attr('loop')).to.exist;
        expect($el.attr('autoplay')).to.exist;
        // With jQuery's `.attr()` method, the value for properly set boolean attributes
        // will be the same as the attribute name itself
        expect($el.attr('loop')).to.equal('loop');
        expect($el.attr('autoplay')).to.equal('autoplay');
      });
    });

    it('all amp-video elements should only contain the allowed attributes', () => {
      const AMPVideoSelectors = [...Object.values(selectors.videos)];

      AMPVideoSelectors.forEach(selector =>
        testAllowedAttributes('amp-video', selector)
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

    it('the third audio element should have the `loop`, `muted`, and `autoplay` boolean attributes without any values', () => {
      cy.get(selectors.audio.rideOfTheValkyriesWithBooleanAttributes).then(
        $el => {
          expect($el.attr('loop')).to.exist;
          expect($el.attr('autoplay')).to.exist;
          expect($el.attr('muted')).to.exist;
          // With jQuery's `.attr()` method, the value for properly set boolean attributes
          // will be the same as the attribute name itself, with the exception of `muted`, which
          // defaults to an empty string
          expect($el.attr('loop')).to.equal('loop');
          expect($el.attr('autoplay')).to.equal('autoplay');
          expect($el.attr('muted')).to.equal('');
        }
      );
    });

    it('all amp-audio elements should only contain the allowed attributes', () => {
      const AMPAudioSelectors = [...Object.values(selectors.audio)];

      AMPAudioSelectors.forEach(selector =>
        testAllowedAttributes('amp-audio', selector)
      );
    });
  });
});
