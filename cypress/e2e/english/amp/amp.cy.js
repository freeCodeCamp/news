const {
  allowedAMPAttributes
} = require('../../../../utils/transforms/html-sanitizer');

const stripAutoAMPAttributes = attrArr =>
  attrArr.filter(
    attr => !['class', 'style'].includes(attr) && !attr.startsWith('i-amphtml')
  );

const testAllowedAttributes = (type, el) => {
  const attributes = stripAutoAMPAttributes(el.getAttributeNames());
  const diff = attributes.filter(
    attr => !allowedAMPAttributes[type].includes(attr)
  );

  expect(diff).to.have.length(0);
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
      cy.get("[data-test-label='site-nav-logo']")
        .find('amp-img')
        .then($el => {
          expect($el[0].tagName).to.equal('AMP-IMG');
        });
    });

    it('the first image of cats should have the expected attributes and values', () => {
      cy.contains('Image:')
        .next()
        .find('amp-img')
        .then($el => {
          expect($el.attr('width')).to.equal('400');
          expect($el.attr('height')).to.equal('222');
          expect($el.attr('alt')).to.equal('cats');
          expect($el.attr('layout')).to.equal('responsive');
        });
    });

    it('the second image of cats should have a figcaption with the expected text', () => {
      cy.contains('Image with a caption:')
        .next()
        .find('figcaption')
        .contains('Cats in a field');
    });

    it('the small fCC icon should have a `layout` attribute with the value `fixed`', () => {
      cy.contains('Image < 300px wide:')
        .next()
        .find('amp-img')
        .then($el => {
          expect($el.attr('layout')).to.equal('fixed');
        });
    });

    it('all amp-img elements should only contain the allowed attributes', () => {
      cy.document().then(doc => {
        const AMPImgElements = [...doc.querySelectorAll('amp-img')];

        AMPImgElements.forEach(el => testAllowedAttributes('amp-img', el));
      });
    });
  });

  context('<amp-anim>', () => {
    it('the first typing cat gif should have the expected attributes and values', () => {
      cy.contains('Gif:')
        .next()
        .find('amp-anim')
        .then($el => {
          expect($el.attr('width')).to.equal('340');
          expect($el.attr('height')).to.equal('340');
          expect($el.attr('alt')).to.equal('cat-typing');
          expect($el.attr('layout')).to.equal('responsive');
        });
    });

    it('the second typing cat gif should have a figcaption with the expected text', () => {
      cy.contains('Gif with caption:')
        .next()
        .get('figcaption')
        .contains('Tap tap tappity tap');
    });

    it('all amp-anim elements should only contain the allowed attributes', () => {
      cy.document().then(doc => {
        const AMPAnimElements = [...doc.querySelectorAll('amp-anim')];

        AMPAnimElements.forEach(el => testAllowedAttributes('amp-anim', el));
      });
    });
  });

  context('<amp-youtube>', () => {
    it('should have the expected attributes and values', () => {
      cy.contains('YouTube embed:')
        .next()
        .find('amp-youtube')
        .then($el => {
          expect($el.attr('width')).to.equal('200');
          expect($el.attr('height')).to.equal('113');
          expect($el.attr('layout')).to.equal('responsive');
          expect($el.attr('data-videoid')).to.equal('8TDsGUFFXSY');
        });
    });

    it('the amp-youtube element should only contain the allowed attributes', () => {
      cy.document().then(doc => {
        const AMPYouTubeElements = [...doc.querySelectorAll('amp-youtube')];

        AMPYouTubeElements.forEach(el =>
          testAllowedAttributes('amp-youtube', el)
        );
      });
    });
  });

  context('<amp-iframe>', () => {
    it('the GIPHY iframe should have the expected attributes and values', () => {
      // GIPHY iframes are not wrapped in a kg-embed-card
      cy.contains('GIPHY embed:')
        .next()
        .then($el => {
          expect($el.attr('width')).to.equal('384');
          expect($el.attr('height')).to.equal('480');
          expect($el.attr('frameborder')).to.equal('0');
        });
    });

    it('the CodePen iframe should have the expected attributes and values', () => {
      // CodePen iframes are wrapped in a kg-embed-card
      cy.contains('CodePen iframe embed')
        .next()
        .find('amp-iframe')
        .then($el => {
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
      cy.document().then(doc => {
        const AMPIframeElements = [...doc.querySelectorAll('amp-iframe')];

        AMPIframeElements.forEach(el =>
          testAllowedAttributes('amp-iframe', el)
        );
      });
    });
  });

  context('<amp-video>', () => {
    it('the first video should have the expected attributes and values', () => {
      // HTML5 video elements are not wrapped in a kg-embed-card
      cy.contains('Video:')
        .next()
        .then($el => {
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
      cy.contains('Video with no src attribute')
        .next()
        .then($el => {
          expect($el.attr('src')).to.not.exist;
        })
        .find('source')
        .then($el => {
          expect($el.attr('src')).to.equal(
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          );
        });
    });

    it('the third video should have the `loop` and `autoplay` boolean attributes without any values', () => {
      cy.contains('Video with src and the loop, muted=muted')
        .next()
        .then($el => {
          expect($el.attr('loop')).to.exist;
          expect($el.attr('autoplay')).to.exist;
          // With jQuery's `.attr()` method, the value for properly set boolean attributes
          // will be the same as the attribute name itself
          expect($el.attr('loop')).to.equal('loop');
          expect($el.attr('autoplay')).to.equal('autoplay');
        });
    });

    it('all amp-video elements should only contain the allowed attributes', () => {
      cy.document().then(doc => {
        const AMPVideoElements = [...doc.querySelectorAll('amp-video')];

        AMPVideoElements.forEach(el => testAllowedAttributes('amp-video', el));
      });
    });
  });

  context('<amp-audio>', () => {
    it('the first audio element should have the expected attributes and values', () => {
      // HTML5 audio elements are not wrapped in a kg-embed-card
      cy.contains('Audio with src:')
        .next()
        .then($el => {
          expect($el.attr('src')).to.equal(
            'https://ia801402.us.archive.org/16/items/EDIS-SRP-0197-06/EDIS-SRP-0197-06.mp3'
          );
          expect($el.attr('controls')).to.exist;
        });
    });

    it('the second audio element should have a child `source` element and no `src` attribute', () => {
      cy.contains('Audio with a child source element:')
        .next()
        .then($el => {
          expect($el.attr('src')).to.not.exist;
        })
        .find('source')
        .then($el => {
          expect($el.attr('src')).to.equal(
            'https://ia801402.us.archive.org/16/items/EDIS-SRP-0197-06/EDIS-SRP-0197-06.mp3'
          );
        });
    });

    it('the third audio element should have the `loop`, `muted`, and `autoplay` boolean attributes without any values', () => {
      cy.contains('Audio with src and the loop, muted=muted')
        .next()
        .then($el => {
          expect($el.attr('loop')).to.exist;
          expect($el.attr('autoplay')).to.exist;
          expect($el.attr('muted')).to.exist;
          // With jQuery's `.attr()` method, the value for properly set boolean attributes
          // will be the same as the attribute name itself, with the exception of `muted`, which
          // defaults to an empty string
          expect($el.attr('loop')).to.equal('loop');
          expect($el.attr('autoplay')).to.equal('autoplay');
          expect($el.attr('muted')).to.equal('');
        });
    });

    it('all amp-audio elements should only contain the allowed attributes', () => {
      cy.document().then(doc => {
        const AMPAudioElements = [...doc.querySelectorAll('amp-audio')];

        AMPAudioElements.forEach(el => testAllowedAttributes('amp-audio', el));
      });
    });
  });
});
