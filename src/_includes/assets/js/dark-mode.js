function loadDarkModePreference() {
  const theme = localStorage.getItem('theme');
  if (
    window.matchMedia('(prefers-color-scheme: dark)')?.matches ||
    theme == 'dark' ||
    theme == 'night'
  ) {
    document.body.classList.add('dark-mode');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDarkModePreference();
  document
    .getElementById('toggle-dark-mode')
    .addEventListener('click', function () {
      const currentTheme = localStorage.getItem('theme');
      const invertedTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', invertedTheme);
      document.body.classList.toggle('dark-mode');
    });
});
