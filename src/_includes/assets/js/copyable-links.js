document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('h1, h2, h3');
  console.log(headers);
  headers.forEach(header => {
    const Link = document.createElement('a');
    Link.href = `#${header.id}`;
    Link.classList.add('navigationHead');
    Link.ariaLabel = 'Click to copy header link';

    header.parentNode?.insertBefore(Link, header);
    Link.appendChild(header);
    Link.addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard
        .writeText(`${window.location.href.split('#')[0]}#${header.id}`)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy!', err));
    });
  });
});
