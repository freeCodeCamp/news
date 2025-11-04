document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('toggle-button-nav')
    .addEventListener('click', function () {
      const dropDownMenu = document.getElementById('menu-dropdown');
      dropDownMenu.classList.toggle('display-menu');
    });
});
