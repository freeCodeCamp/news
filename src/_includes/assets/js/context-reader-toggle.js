document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'contextReader:enabled';
  const toggleButton = document.getElementById('context-reader-toggle');
  if (!toggleButton) return;

  const stateLabel = toggleButton.querySelector('.toggle-state');

  const setToggleState = isEnabled => {
    toggleButton.setAttribute('aria-pressed', String(isEnabled));
    if (stateLabel) {
      stateLabel.textContent = isEnabled ? 'ON' : 'OFF';
    }
  };

  setToggleState(localStorage.getItem(STORAGE_KEY) === 'true');

  toggleButton.addEventListener('click', () => {
    const isEnabled = toggleButton.getAttribute('aria-pressed') !== 'true';

    localStorage.setItem(STORAGE_KEY, String(isEnabled));
    setToggleState(isEnabled);
    document.dispatchEvent(
      new CustomEvent('context-reader:toggle', {
        detail: { enabled: isEnabled }
      })
    );
  });
});
