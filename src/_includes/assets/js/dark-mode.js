document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-dark-mode');
  if (!toggleButton) return;

  const onIcon = toggleButton.querySelector('i');
  const prismLight = document.getElementById('prism-theme-light');
  const prismDark = document.getElementById('prism-theme-dark');

  const syncIcon = isDark => {
    if (!onIcon) return;
    onIcon.classList.toggle('fa-square-check', isDark);
    onIcon.classList.toggle('fa-square', !isDark);
  };

  const syncPrism = isDark => {
    if (prismLight) prismLight.disabled = isDark;
    if (prismDark) prismDark.disabled = !isDark;
  };

  const applyTheme = (isDark, { persist = true } = {}) => {
    document.documentElement.classList.toggle('dark-mode', isDark);
    toggleButton.setAttribute('aria-pressed', String(isDark));
    syncIcon(isDark);
    syncPrism(isDark);
    if (persist) localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // Reconcile initial paint: inline FOUC script only flips html.dark-mode,
  // leaving the SSR-rendered icon + prism stylesheet state out of sync.
  const initialIsDark =
    document.documentElement.classList.contains('dark-mode');
  toggleButton.setAttribute('aria-pressed', String(initialIsDark));
  syncIcon(initialIsDark);
  syncPrism(initialIsDark);

  toggleButton.addEventListener('click', () => {
    const next = !document.documentElement.classList.contains('dark-mode');
    applyTheme(next);
  });

  // Honor OS-level pref changes only when the user hasn't made an explicit
  // choice. A click persists 'theme' in localStorage and disables this path.
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = event => {
    if (localStorage.getItem('theme')) return;
    applyTheme(event.matches, { persist: false });
  };
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onSystemChange);
  } else if (typeof mq.addListener === 'function') {
    // Safari < 14 fallback
    mq.addListener(onSystemChange);
  }
});
