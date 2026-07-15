document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'contextReader:enabled';
  const NATIVE_LANGUAGE_KEY = 'contextReader:nativeLanguage';
  const LEARNING_LANGUAGE_KEY = 'contextReader:learningLanguage';
  const toggleButton = document.getElementById('context-reader-toggle');
  if (!toggleButton) return;

  const stateLabel = toggleButton.querySelector('.toggle-state');
  const settingsPanel = document.getElementById('context-reader-settings');
  const nativeLanguageSelect = document.getElementById(
    'context-reader-native-language'
  );

  const setToggleState = isEnabled => {
    toggleButton.setAttribute('aria-pressed', String(isEnabled));
    if (stateLabel) {
      stateLabel.textContent = isEnabled ? 'ON' : 'OFF';
    }
    if (settingsPanel) {
      settingsPanel.hidden = !isEnabled;
    }
  };

  if (nativeLanguageSelect) {
    nativeLanguageSelect.value =
      localStorage.getItem(NATIVE_LANGUAGE_KEY) ?? nativeLanguageSelect.value;
    nativeLanguageSelect.addEventListener('change', () => {
      localStorage.setItem(NATIVE_LANGUAGE_KEY, nativeLanguageSelect.value);
      localStorage.setItem(LEARNING_LANGUAGE_KEY, 'en');
      document.dispatchEvent(
        new CustomEvent('context-reader:language-change', {
          detail: {
            nativeLanguage: nativeLanguageSelect.value,
            learningLanguage: 'en'
          }
        })
      );
    });
  }

  localStorage.setItem(LEARNING_LANGUAGE_KEY, 'en');

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
