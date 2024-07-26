function loadDarkModePreference() {
  const darkMode = localStorage.getItem('fcc-dark-mode');
  if (darkMode === 'enabled' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
}


document.addEventListener("DOMContentLoaded", () =>
{
  loadDarkModePreference();
  document.getElementById('toggle-dark-mode').addEventListener('click', function ()
  {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('fcc-dark-mode', 'enabled');
    } else {
      localStorage.setItem('fcc-dark-mode', 'disabled');
    }
  });
}
)

