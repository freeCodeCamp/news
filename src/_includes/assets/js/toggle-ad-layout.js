// Global
const notAuthenticated = !document.cookie.split(';')
    .some((item) => item.trim()
    .startsWith('jwt_access_token='));

document.addEventListener('DOMContentLoaded', () => {
  document.cookie = 'reader=1; SameSite=None; Secure';
  const inner = document.querySelector('.inner');

  if (notAuthenticated) {
    inner.classList.add('ad-layout');
  }
});
