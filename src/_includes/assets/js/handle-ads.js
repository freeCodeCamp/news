document.addEventListener('DOMContentLoaded', () => {
  const adsEnabled = '{{ secrets.adsEnabled }}' === 'true';

  if (adsEnabled) {
    // May not be necessary
    document.cookie = 'reader=1; SameSite=None; Secure';
    const sidebar = document.querySelector('.sidebar');
    const bannerAd = document.querySelector('.banner-ad');
    const postAndSidebar = document.querySelector('.post-and-sidebar');
    const postFullContent = document.querySelector('.post-full-content');
    const notAuthenticated = !document.cookie.split(';')
      .some((item) => item.trim()
      .startsWith('jwt_access_token='));

    if (notAuthenticated) {
      sidebar.style.display = 'flex';
      bannerAd.style.display = 'block';

      // These changes may be too noticeable
      postAndSidebar.style.display = 'grid';
      postFullContent.style.padding = '70px 0 0';
    }
  }
});
