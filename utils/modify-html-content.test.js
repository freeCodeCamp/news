const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const modifyHTMLContent = require('./modify-html-content');

const mockPostContent = {
  youtubeEmbed: {
    postContent:
      '<h2 id="heading-youtube">YouTube</h2>\n<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://www.youtube.com/watch?v=KZe0C0Qq4p0">https://www.youtube.com/watch?v=KZe0C0Qq4p0</a></div>',
    postTitle: 'Test Post',
    source: 'Hashnode'
  }
};

describe('modifyHTMLContent', () => {
  it('should modify the HTML content', async () => {
    const modifiedContent = await modifyHTMLContent({
      postContent: mockPostContent.youtubeEmbed.postContent,
      postTitle: mockPostContent.youtubeEmbed.postTitle,
      source: mockPostContent.youtubeEmbed.source
    });

    // console.log(modifiedContent);
  });
});
