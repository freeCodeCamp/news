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
});
