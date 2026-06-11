document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('toggle-lang-button')
    .addEventListener('click', function () {
      const dropDownMenu = document.getElementById('nav-lang-list');
      const toggleButton = document.getElementById('toggle-lang-button');
      dropDownMenu.classList.toggle('display-menu');
      toggleButton.ariaExpanded =
        toggleButton.ariaExpanded == 'true' ? 'false' : 'true';
    });

  const createLanguageRedirect = ({ lang }) => {
    const pathArray = window?.location?.pathname?.split('/');
    const path = pathArray
      .filter(item => (item !== lang ? item : ''))
      .join('/');

    const hostTail = window?.location?.host;
    const nextLocation = `${window?.location?.protocol}//${hostTail}`;

    if (lang === 'english') return `${nextLocation}/${path}`;

    return `${nextLocation}/${lang}/${path}`;
  };

  const languageOptions = document.querySelectorAll('.nav-lang-list-option');
  languageOptions.forEach(languageOption => {
    languageOption.addEventListener('click', () => {
      const selectedLanguage = languageOption.dataset.value;
      if (selectedLanguage === undefined) return;
      const path = createLanguageRedirect({
        lang: selectedLanguage
      });
      window.location.href = path;
    });
  });
});
