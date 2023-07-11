const selectors = {
  fluidWidthVideoContainer: "[data-test-label='fluid-width-video-container']",
  fluidWidthVideoWrapper: "[data-test-label='fluid-width-video-wrapper']"
};

const checkEmbeddedVideo = (headingSelector, elementName, videoURL, i) => {
  cy.get(headingSelector)
    .next()
    .next()
    .then($el => {
      const figure = $el[0];

      expect(figure.tagName.toLowerCase()).to.equal('figure');
      expect(figure.className).to.equal('kg-card kg-embed-card');
      cy.wrap(figure).find(selectors.fluidWidthVideoContainer);
      cy.wrap(figure)
        .find(selectors.fluidWidthVideoWrapper)
        .then($el => {
          const fluidWidthVideoWrapper = $el[0];

          expect(fluidWidthVideoWrapper.style.paddingTop).to.exist;
        });
      cy.wrap(figure)
        .find(elementName)
        .then($el => {
          const targetEl = $el[0];

          expect(
            targetEl[elementName === 'object' ? 'data' : 'src']
          ).to.include(videoURL);
          expect(targetEl.name).to.equal(`fitvid${i}`);
        });
    });
};

module.exports = checkEmbeddedVideo;
