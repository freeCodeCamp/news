document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('toggle-button-nav')
    .addEventListener('click', function () {
      const dropDownMenu = document.getElementById('menu-dropdown');
      const toggleButton = document.getElementById('toggle-button-nav');
      dropDownMenu.classList.toggle('display-menu');
      toggleButton.ariaExpanded =
        toggleButton.ariaExpanded == 'true' ? 'false' : 'true';
    });
});
