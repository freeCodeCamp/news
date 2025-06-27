import jsdom from 'jsdom';
const { JSDOM } = jsdom;

import { modifyHTMLContent } from './modify-html-content.js';
import { translate } from './translate.js';

const mockHashnodeEmbeds = {
  youtube:
    '<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://www.youtube.com/watch?v=KZe0C0Qq4p0">https://www.youtube.com/watch?v=KZe0C0Qq4p0</a></div>',
  giphy:
    '<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://giphy.com/gifs/computer-cat-wearing-glasses-VbnUQpnihPSIgIXuZv">https://giphy.com/gifs/computer-cat-wearing-glasses-VbnUQpnihPSIgIXuZv</a></div>',
  twitter:
    '<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://twitter.com/freeCodeCamp/status/1780642881054609864">https://twitter.com/freeCodeCamp/status/1780642881054609864</a></div>',
  x: '<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://x.com/freeCodeCamp/status/1793688847299018852">https://x.com/freeCodeCamp/status/1793688847299018852</a></div>',
  githubGist:
    '<div class="gist-block embed-wrapper" data-gist-show-loading="false" data-id="539dbbd01ebfd36fd8a671124d290f5a"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a href="https://gist.github.com/scissorsneedfoodtoo/539dbbd01ebfd36fd8a671124d290f5a" class="embed-card">https://gist.github.com/scissorsneedfoodtoo/539dbbd01ebfd36fd8a671124d290f5a</a></div>',
  iframeInHTMLBlock:
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/N1pYdEAU9mk?si=BapivyRfMfD99MTc"></iframe>'
};

describe('modifyHTMLContent', () => {
  it('common embeds like YouTube should return the expected modified HTML', async () => {
    const modifiedHTML = await modifyHTMLContent({
      postContent: mockHashnodeEmbeds.youtube,
      postTitle: 'Test Post',
      source: 'Hashnode'
    });
    const dom = new JSDOM(modifiedHTML);
    const document = dom.window.document;
    const iframeEl = document.querySelector('iframe');

    expect(iframeEl).toBeTruthy();
    expect(iframeEl.src).toBe('https://www.youtube.com/embed/KZe0C0Qq4p0');
    expect(iframeEl.width).toBe('560');
    expect(iframeEl.height).toBe('315');
    expect(iframeEl.title).toBe('YouTube video player');
    expect(iframeEl.getAttribute('style')).toBe(
      'aspect-ratio: 16 / 9; width: 100%; height: auto;'
    );
    expect(iframeEl.getAttribute('allow')).toBe(
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    expect(iframeEl.getAttribute('referrerpolicy')).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(iframeEl.getAttribute('allowfullscreen')).toBe('');
    expect(iframeEl.getAttribute('loading')).toBe('lazy');

    // Check if the iframeEl is wrapped in a div with the expected class
    expect(iframeEl.parentElement.tagName).toBe('DIV');
    expect(iframeEl.parentElement.classList).toContain('embed-wrapper');
  });

  it('Giphy embeds should return the expected modified HTML', async () => {
    const modifiedHTML = await modifyHTMLContent({
      postContent: mockHashnodeEmbeds.giphy,
      postTitle: 'Test Post',
      source: 'Hashnode'
    });
    const dom = new JSDOM(modifiedHTML);
    const document = dom.window.document;
    const iframeEl = document.querySelector('iframe');

    expect(iframeEl).toBeTruthy();
    expect(iframeEl.src).toBe('https://giphy.com/embed/VbnUQpnihPSIgIXuZv');
    expect(iframeEl.width).toBe('100%');
    expect(iframeEl.height).toBe('100%');
    expect(iframeEl.title).toBe('Giphy embed');
    expect(iframeEl.getAttribute('style')).toBe('position: absolute');
    expect(iframeEl.getAttribute('allowfullscreen')).toBe('');

    // Check if the iframeEl is wrapped in a divs with the expected classes
    expect(iframeEl.parentElement.tagName).toBe('DIV');
    expect(iframeEl.parentElement.classList).toContain('giphy-wrapper');
    expect(iframeEl.parentElement.getAttribute('style')).toBe(
      'width: 100%; height: 0; padding-bottom: 125%; position: relative;'
    );
    expect(iframeEl.parentElement.parentElement.tagName).toBe('DIV');
    expect(iframeEl.parentElement.parentElement.classList).toContain(
      'embed-wrapper'
    );
  });

  it('Twitter embeds should return the expected modified HTML', async () => {
    const modifiedHTML = await modifyHTMLContent({
      postContent: mockHashnodeEmbeds.twitter,
      postTitle: 'Test Post',
      source: 'Hashnode'
    });
    const dom = new JSDOM(modifiedHTML);
    const document = dom.window.document;
    const blockquoteEl = document.querySelector('blockquote');
    const scriptEl = document.querySelector('script');

    expect(blockquoteEl).toBeTruthy();
    expect(blockquoteEl.classList).toContain('twitter-tweet');
    expect(blockquoteEl.children.length).toBe(1);
    expect(blockquoteEl.querySelector('a').href).toBe(
      'https://twitter.com/freeCodeCamp/status/1780642881054609864'
    );
    expect(scriptEl).toBeTruthy();
    expect(scriptEl.src).toBe('https://platform.twitter.com/widgets.js');
    expect(scriptEl.getAttribute('defer')).toBe('');

    // Check if the blockquoteEl is wrapped in a div with the expected class
    expect(blockquoteEl.parentElement.tagName).toBe('DIV');
    expect(blockquoteEl.parentElement.classList).toContain('embed-wrapper');
  });

  it('X embeds should return the expected modified HTML', async () => {
    const modifiedHTML = await modifyHTMLContent({
      postContent: mockHashnodeEmbeds.x,
      postTitle: 'Test Post',
      source: 'Hashnode'
    });
    const dom = new JSDOM(modifiedHTML);
    const document = dom.window.document;
    const blockquoteEl = document.querySelector('blockquote');
    const scriptEl = document.querySelector('script');

    expect(blockquoteEl).toBeTruthy();
    expect(blockquoteEl.classList).toContain('twitter-tweet');
    expect(blockquoteEl.children.length).toBe(1);
    expect(blockquoteEl.querySelector('a').href).not.toContain('x.com');
    expect(blockquoteEl.querySelector('a').href).toBe(
      'https://twitter.com/freeCodeCamp/status/1793688847299018852'
    );
    expect(scriptEl).toBeTruthy();
    expect(scriptEl.src).toBe('https://platform.twitter.com/widgets.js');
    expect(scriptEl.getAttribute('defer')).toBe('');

    // Check if the blockquoteEl is wrapped in a div with the expected class
    expect(blockquoteEl.parentElement.tagName).toBe('DIV');
    expect(blockquoteEl.parentElement.classList).toContain('embed-wrapper');
  });

  it('GitHub Gist embeds should return the expected modified HTML', async () => {
    const modifiedHTML = await modifyHTMLContent({
      postContent: mockHashnodeEmbeds.githubGist,
      postTitle: 'Test Post',
      source: 'Hashnode'
    });
    const dom = new JSDOM(modifiedHTML);
    const document = dom.window.document;
    const scriptEl = document.querySelector('script');

    expect(scriptEl).toBeTruthy();
    expect(scriptEl.src).toBe(
      'https://gist.github.com/scissorsneedfoodtoo/539dbbd01ebfd36fd8a671124d290f5a.js'
    );

    // Check if the scriptEl is wrapped in a div with the expected class
    expect(scriptEl.parentElement.tagName).toBe('DIV');
    expect(scriptEl.parentElement.classList).toContain('gist-block'); // This gets added by the gist-embed package
    expect(scriptEl.parentElement.classList).toContain('embed-wrapper');
  });

  it('iframes in HTML blocks should return the expected modified HTML', async () => {
    const modifiedHTML = await modifyHTMLContent({
      postContent: mockHashnodeEmbeds.iframeInHTMLBlock,
      postTitle: 'Test Post',
      source: 'Hashnode'
    });
    const dom = new JSDOM(modifiedHTML);
    const document = dom.window.document;
    const iframeEl = document.querySelector('iframe');

    expect(iframeEl).toBeTruthy();
    expect(iframeEl.src).toBe(
      'https://www.youtube.com/embed/N1pYdEAU9mk?si=BapivyRfMfD99MTc'
    );
    expect(iframeEl.width).toBe('560');
    expect(iframeEl.height).toBe('315');
    expect(iframeEl.title).toBe(translate('embed-title'));

    // Check if the iframeEl is wrapped in a div with the expected class
    expect(iframeEl.parentElement.tagName).toBe('DIV');
    expect(iframeEl.parentElement.classList).toContain('embed-wrapper');
  });
});
