const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fitvids = require('./fitvids');

const testCases = [
  {
    case: 'YouTube',
    html: `<iframe
        width="200"
        height="113"
        src="https://www.youtube.com/embed/rfscVS0vtbw?feature=oembed"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen=""
        title="Embedded content"
      ></iframe>`
  },
  {
    case: 'Vimeo',
    html: `<iframe
        src="https://player.vimeo.com/video/700486996?app_id=122963"
        width="426"
        height="226"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen=""
        title="Embedded content"
      ></iframe>`
  },
  {
    case: 'Bilibili',
    html: `<iframe
        src="//player.bilibili.com/player.html?aid=370761589&amp;bvid=BV1iZ4y1p7kr&amp;cid=232794309&amp;page=1"
        scrolling="no"
        border="0"
        frameborder="no"
        framespacing="0"
        allowfullscreen="true"
      ></iframe>`
  },
  {
    case: 'Embed',
    html: `<embed
      type="video/mp4"
      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      width="720"
      height="405"
      title="Big Buck Bunny">`
  },
  {
    case: 'Object',
    html: `<object
      type="video/mp4"
      data="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      width="720"
      height="405">`
  },
  {
    case: 'Link pasted into the Ghost editor and auto-wrapped in figure.kg-embed-card element',
    html: `<figure class="kg-card kg-embed-card">
        <iframe
          width="200"
          height="113"
          src="https://www.youtube.com/embed/rfscVS0vtbw?feature=oembed"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen=""
          title="Embedded content"
        >
        </iframe>
      </figure>`
  },
  {
    case: 'Multiple embeds',
    html: `<iframe
        width="200"
        height="113"
        src="https://www.youtube.com/embed/rfscVS0vtbw?feature=oembed"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen=""
        title="Embedded content"
      ></iframe>
      <iframe
        src="https://player.vimeo.com/video/700486996?app_id=122963"
        width="426"
        height="226"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen=""
        title="Embedded content"
      ></iframe>`
  }
];

const checkEmbeddedVideos = obj => {
  describe(obj.case, () => {
    const dom = new JSDOM(obj.html);
    const window = dom.window;
    const document = window.document;
    fitvids(window);

    document.querySelectorAll('figure').forEach((figure, i) => {
      const fluidWidthVideoContainer =
        document.querySelectorAll('figure > div')[i];
      const fluidWidthVideoWrapper =
        document.querySelectorAll('figure > div > div')[i];
      const embeddedVideo = document.querySelectorAll('figure > div > div > *')[
        i
      ];

      test('there is no inner figure element', () => {
        expect(figure.querySelectorAll('figure').length).toBe(0);
      });

      test('the figure element has the attributes and values', () => {
        expect(figure.className).toBe('kg-card kg-embed-card');
        expect(figure.getAttribute('data-test-label')).toBe('fitted');
      });

      test('the fluid width video container has the expected class name', () => {
        expect(fluidWidthVideoContainer.className).toBe(
          'fluid-width-video-container'
        );
      });

      test('the fluid width video wrapper has the expected attributes and values', () => {
        expect(fluidWidthVideoWrapper.className).toBe(
          'fluid-width-video-wrapper'
        );
        expect(
          parseFloat(fluidWidthVideoWrapper.style.paddingTop)
        ).toBeTruthy();
      });

      test('the embedded video has the expected attributes and values', () => {
        // Some embedded videos like ones from Bilibili don't have width and height attributes,
        // so fitvids adds them.
        expect(typeof parseInt(embeddedVideo.width)).toBe('number');
        expect(typeof parseInt(embeddedVideo.height)).toBe('number');
        expect(embeddedVideo.name).toBe(`fitvid${i}`);
      });
    });
  });
};

testCases.forEach(checkEmbeddedVideos);
