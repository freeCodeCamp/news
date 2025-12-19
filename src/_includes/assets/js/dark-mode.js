function loadDarkModePreference() {
  const theme = localStorage.getItem('theme');
  if (
    window.matchMedia('(prefers-color-scheme: dark)')?.matches ||
    theme == 'dark'
  ) {
    localStorage.setItem('theme', 'dark');
    document.body.classList.add('dark-mode');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDarkModePreference();
  document
    .getElementById('toggle-dark-mode')
    .addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
});
