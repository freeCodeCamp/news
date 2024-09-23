// Get the button:
let goTopButton = document.getElementById('scrollToTop');

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    // @ts-ignore
    goTopButton.style.display = 'block';
  } else {
    // @ts-ignore
    goTopButton.style.display = 'none';
  }
}

// eslint-disable-next-line no-unused-vars
function goToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
