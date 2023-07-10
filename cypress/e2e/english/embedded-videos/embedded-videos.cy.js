const checkEmbeddedVideo = require('../../../support/utils/check-embedded-video');

const selectors = {
  embeddedVideos: {
    fluidWidthVideoContainer: "[data-test-label='fluid-width-video-container']",
    fluidWidthVideoWrapper: "[data-test-label='fluid-width-video-wrapper']",
    ghostEditor: {
      vimeoHeading:
        "[data-test-label='vimeo-link-pasted-into-ghost-editor-heading']",
      youtubeHeading:
        "[data-test-label='youtube-link-pasted-into-ghost-editor-heading']"
    },
    markdown: {
      bilibiliHeading: "[data-test-label='bilibili-embedded-iframe-heading']",
      vimeoHeading: "[data-test-label='vimeo-embedded-iframe-heading']",
      youtubeHeading: "[data-test-label='youtube-embedded-iframe-heading']"
    },
    postContent: "[data-test-label='post-content']"
  }
};

const contexts = [
  {
    title: 'Embedded Videos Page',
    path: '/embedded-videos-page'
  },
  {
    title: 'Embedded Videos Post',
    path: '/embedded-videos-post'
  }
];

describe('Embedded videos', () => {
  contexts.forEach(currContext => {
    context(currContext.title, () => {
      before(() => {
        cy.visit(currContext.path);
      });

      it('should render', () => {
        cy.contains(currContext.title);
      });

      context('Ghost editor', () => {
        it('should render the YouTube video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.ghostEditor.youtubeHeading,
            'https://www.youtube.com/embed/rfscVS0vtbw',
            0
          );
        });

        it('should render the Vimeo video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.ghostEditor.vimeoHeading,
            'https://player.vimeo.com/video/700486996',
            1
          );
        });
      });

      context('Markdown', () => {
        it('should render the YouTube video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.youtubeHeading,
            'https://www.youtube.com/embed/PkZNo7MFNFg',
            2
          );
        });

        it('should render the Vimeo video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.vimeoHeading,
            'https://player.vimeo.com/video/700486996',
            3
          );
        });

        it('should render the Bilibili video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.bilibiliHeading,
            '//player.bilibili.com/player.html?aid=370761589&bvid=BV1iZ4y1p7kr&',
            4
          );
        });

        it('post content should end with the expected p element', () => {
          cy.get(selectors.embeddedVideos.postContent)
            .find('p')
            .last()
            .then($el => {
              const p = $el[0];

              expect(p.innerText).to.include(
                'Cats secretly make all the worlds muffins.'
              );
            });
        });
      });
    });
  });
});
