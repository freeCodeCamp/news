document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = [
    {
      button: document.getElementById('toggle-lang-button'),
      menu: document.getElementById('lang-dropdown')
    },
    {
      button: document.getElementById('toggle-menu-button'),
      menu: document.getElementById('menu-dropdown')
    }
  ].filter(dropdown => dropdown.button && dropdown.menu);

  const closeDropdown = ({ button, menu }) => {
    menu.classList.remove('display-menu');
    button.ariaExpanded = 'false';
  };

  const openDropdown = ({ button, menu }) => {
    menu.classList.add('display-menu');
    button.ariaExpanded = 'true';
  };

  dropdowns.forEach(dropdown => {
    dropdown.button.addEventListener('click', () => {
      const isOpen = dropdown.menu.classList.contains('display-menu');
      // Close every dropdown so only one can be open at a time
      dropdowns.forEach(closeDropdown);
      if (!isOpen) {
        openDropdown(dropdown);
      }
    });
  });

  // Close any open dropdown when clicking outside of it and its toggle button
  document.addEventListener('click', event => {
    dropdowns.forEach(dropdown => {
      if (
        dropdown.menu.classList.contains('display-menu') &&
        !dropdown.button.contains(event.target) &&
        !dropdown.menu.contains(event.target)
      ) {
        closeDropdown(dropdown);
      }
    });
  });

  // Close any open dropdown when pressing the Escape key
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      dropdowns.forEach(closeDropdown);
    }
  });
});
