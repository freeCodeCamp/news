/* eslint-disable no-unused-vars */
const fitVids = (window, document) => {
  let count = 0;

  [...document.children].forEach(node => {
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
        !window.getComputedStyle(videoNode)['height'] &&
        !window.getComputedStyle(videoNode)['width'] &&
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
                window
                  .getComputedStyle(videoNode, null)
                  .height.replace('px', '')
              ),
        width = !isNaN(parseInt(videoNode.getAttribute('width'), 10))
          ? parseInt(videoNode.getAttribute('width'), 10)
          : parseFloat(
              window.getComputedStyle(videoNode, null).width.replace('px', '')
            ),
        aspectRatio = height / width;

      if (!videoNode.getAttribute('name')) {
        const videoName = 'fitvid' + count;
        videoNode.setAttribute('name', videoName);
        count++;
      }

      const videoContainer = document.createElement('div');
      videoContainer.classList.add('fluid-width-video-container');
      videoContainer.setAttribute(
        'data-test-label',
        'fluid-width-video-container'
      );

      const videoWrapper = document.createElement('div');
      videoWrapper.style.paddingTop = `${aspectRatio * 100}%`;
      videoWrapper.classList.add('fluid-width-video-wrapper');
      videoWrapper.setAttribute('data-test-label', 'fluid-width-video-wrapper');

      // Append wrappers and video to page
      videoNode.parentNode.replaceChild(videoContainer, videoNode);
      videoContainer.appendChild(videoWrapper);
      videoWrapper.appendChild(videoNode);

      if (videoNode.getAttribute('height')) videoNode.removeAttribute('height');
      if (videoNode.getAttribute('width')) videoNode.removeAttribute('width');
    });
  });
};

module.exports = fitVids;
