/* eslint-disable no-unused-vars */
if (window) {
  window.fitVids = postContent => {
    let count = 0;

    if (!document.getElementById('fit-vids-style')) {
      const head = document.head || document.getElementsByTagName('head')[0];
      const css =
        // eslint-disable-next-line max-len
        '.fluid-width-video-container{flex-grow: 1;width:100%;}.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      const div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    [...postContent.children].forEach(node => {
      const selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'iframe[src*="player.bilibili.com"]',
        'object',
        'embed'
      ];

      let allVideos = [...node.querySelectorAll(selectors.join(','))];
      allVideos = allVideos.filter(node => node !== 'object object');

      allVideos.forEach(videoNode => {
        if (
          (videoNode.tagName.toLowerCase() === 'embed' &&
            videoNode.parentNode.getAttribute('object').length) ||
          videoNode.parentNode.classList.contains('fluid-width-video-wrapper')
        ) {
          return;
        }
        if (
          !getComputedStyle(videoNode)['height'] &&
          !getComputedStyle(videoNode)['width'] &&
          (isNaN(videoNode.getAttribute('height')) ||
            isNaN(videoNode.getAttribute('width')))
        ) {
          videoNode.setAttribute('height', 9);
          videoNode.setAttribute('width', 16);
        }

        let height =
            videoNode.tagName.toLowerCase() === 'object' ||
            (videoNode.getAttribute('height') &&
              !isNaN(parseInt(videoNode.getAttribute('height'), 10)))
              ? parseInt(videoNode.getAttribute('height'), 10)
              : parseFloat(
                  getComputedStyle(videoNode, null).height.replace('px', '')
                ),
          width = !isNaN(parseInt(videoNode.getAttribute('width'), 10))
            ? parseInt(videoNode.getAttribute('width'), 10)
            : parseFloat(
                getComputedStyle(videoNode, null).width.replace('px', '')
              ),
          aspectRatio = height / width;

        if (!videoNode.getAttribute('name')) {
          const videoName = 'fitvid' + count;
          videoNode.setAttribute('name', videoName);
          count++;
        }

        const videoContainer = document.createElement('div');
        videoContainer.classList.add('fluid-width-video-container');

        const videoWrapper = document.createElement('div');
        videoWrapper.style.paddingTop = `${aspectRatio * 100}%`;
        videoWrapper.classList.add('fluid-width-video-wrapper');

        // Append wrappers and video to page
        videoNode.parentNode.appendChild(videoContainer);
        videoContainer.appendChild(videoWrapper);
        videoWrapper.appendChild(videoNode);

        if (videoNode.getAttribute('height'))
          videoNode.removeAttribute('height');
        if (videoNode.getAttribute('width')) videoNode.removeAttribute('width');
      });
    });
  };
}
