document.addEventListener('DOMContentLoaded', () => {
  // May not be necessary
  document.cookie = 'reader=1; SameSite=None; Secure';
  const inner = document.querySelector('.inner');
  const notAuthenticated = !document.cookie.split(';')
    .some((item) => item.trim()
    .startsWith('jwt_access_token='));

  if (notAuthenticated) {
    inner.classList.add('ad-layout');
  }
});
