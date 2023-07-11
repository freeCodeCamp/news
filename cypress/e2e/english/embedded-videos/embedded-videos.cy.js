const checkEmbeddedVideo = require('../../../support/utils/check-embedded-video');

const selectors = {
  embeddedVideos: {
    ghostEditor: {
      embedElHeading:
        "[data-test-label='embed-element-heading-html-block-in-ghost-editor']",
      objectElHeading:
        "[data-test-label='object-element-heading-html-block-in-ghost-editor']",
      vimeoHeading:
        "[data-test-label='vimeo-heading-link-pasted-into-ghost-editor']",
      youtubeHeading:
        "[data-test-label='youtube-heading-link-pasted-into-ghost-editor']"
    },
    markdown: {
      bilibiliHeading:
        "[data-test-label='bilibili-heading-iframe-in-markdown']",
      embedElHeading:
        "[data-test-label='embed-element-heading-html-in-markdown']",
      objectElHeading:
        "[data-test-label='object-element-heading-html-in-markdown']",
      vimeoHeading: "[data-test-label='vimeo-heading-iframe-in-markdown']",
      youtubeHeading: "[data-test-label='youtube-heading-iframe-in-markdown']"
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
            'iframe',
            'https://www.youtube.com/embed/rfscVS0vtbw',
            0
          );
        });

        it('should render the Vimeo video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.ghostEditor.vimeoHeading,
            'iframe',
            'https://player.vimeo.com/video/700486996',
            1
          );
        });

        it('should render the embed element with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.ghostEditor.embedElHeading,
            'embed',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            2
          );
        });

        it('should render the object element with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.ghostEditor.objectElHeading,
            'object',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            3
          );
        });
      });

      context('Markdown', () => {
        it('should render the YouTube video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.youtubeHeading,
            'iframe',
            'https://www.youtube.com/embed/PkZNo7MFNFg',
            4
          );
        });

        it('should render the Vimeo video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.vimeoHeading,
            'iframe',
            'https://player.vimeo.com/video/700486996',
            5
          );
        });

        it('should render the Bilibili video with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.bilibiliHeading,
            'iframe',
            '//player.bilibili.com/player.html?aid=370761589&bvid=BV1iZ4y1p7kr&',
            6
          );
        });

        it('should render the embed element with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.embedElHeading,
            'embed',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            7
          );
        });

        it('should render the object element with the expected wrappers and attributes', () => {
          checkEmbeddedVideo(
            selectors.embeddedVideos.markdown.objectElHeading,
            'object',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            8
          );
        });
      });

      it('post content should end with the expected p element', () => {
        cy.get(selectors.embeddedVideos.postContent)
          .children()
          .last()
          .then($el => {
            const finalEl = $el[0];

            expect(finalEl.tagName.toLowerCase()).to.equal('p');
          });
      });
    });
  });
});
