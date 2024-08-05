let displayMenu = false;

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('toggle-button-nav')
    .addEventListener('click', function () {
      document.getElementById('nav-list').classList.toggle('display-menu');
      document.getElementById('nav-list').ariaExpanded = String(displayMenu);
    });

  /*
  document.getElementById('toggle-button-nav').addEventListener('blur', function () {
      document.getElementById('nav-list')?.classList.remove("display-menu");
      document.getElementById('nav-list').ariaExpanded = "false";
    });
  */
});
