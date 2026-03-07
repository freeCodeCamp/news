document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-dark-mode');
  const prismLight = document.getElementById('prism-theme-light');
  const prismDark = document.getElementById('prism-theme-dark');
  const isDark = document.documentElement.classList.contains('dark-mode');
  toggleButton.setAttribute('aria-pressed', String(isDark));

  toggleButton.addEventListener('click', function () {
    document.documentElement.classList.toggle('dark-mode');
    const isDarkNow = document.documentElement.classList.contains('dark-mode');
    if (isDarkNow) {
      localStorage.setItem('theme', 'dark');
      this.setAttribute('aria-pressed', 'true');
      if (prismLight) prismLight.disabled = true;
      if (prismDark) prismDark.disabled = false;
    } else {
      localStorage.setItem('theme', 'light');
      this.setAttribute('aria-pressed', 'false');
      if (prismLight) prismLight.disabled = false;
      if (prismDark) prismDark.disabled = true;
    }
  });
});
