const hostname = window.location.hostname;
const discourseEmbedMap = {
  "www.freecodecamp.org": {
    file: "https://forum.freecodecamp.org/srv/status",
    discourseUrl: "https://forum.freecodecamp.org/",
  },
  "chinese.freecodecamp.org": {
    file: "https://chinese.freecodecamp.org/forum/srv/status",
    discourseUrl: "https://chinese.freecodecamp.org/forum/",
  },
  dev: {
    file: "https://forum.freecodecamp.dev/srv/status",
    discourseUrl: "https://forum.freecodecamp.dev/",
  },
};
const discourseEmbedInfo = discourseEmbedMap[hostname]
  ? discourseEmbedMap[hostname]
  : discourseEmbedMap["dev"];
const { file, discourseUrl } = discourseEmbedInfo;

function loadDiscourseComments() {
  const xhr = new XMLHttpRequest();
  const randomNum = Math.round(Math.random() * 10000);
  xhr.open("HEAD", file + "?rand=" + randomNum, true);
  xhr.send();
  xhr.addEventListener("readystatechange", processRequest, false);
  function processRequest() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 304) {
        document.getElementById("discourse-comments").innerHTML = "";
        // eslint-disable-next-line no-undef
        DiscourseEmbed = {
          discourseUrl,
          discourseEmbedUrl: "{{ site.url + post.path }}",
        };
        let d = document.createElement("script");
        d.type = "text/javascript";
        d.async = true;
        d.src = discourseUrl + "javascripts/embed.js";
        (
          document.getElementsByTagName("head")[0] ||
          document.getElementsByTagName("body")[0]
        ).appendChild(d);

        // Remove deprecated scrolling attribute and handle with embedded CSS
        d.onload = () => {
          const discourseEmbedFrame = document.querySelector(
            "#discourse-embed-frame"
          );
          discourseEmbedFrame.removeAttribute("scrolling");
        };
      } else {
        document.getElementById(
          "discourse-comments"
        ).innerHTML = `<div style="text-align: center;">{% t 'comments.error' %}</div>`;
      }
    }
  }
}

if (window && window.addEventListener) {
  // Create comments section
  const commentsDivHtml = `
    <div data-test-label='comments' id='discourse-comments'>
      <button id='trigger-load-comments'>{% t 'comments.show-comments' %}</button>
    </div>
  `;
  const fullContentSection =
    document.getElementsByClassName("post-full-content")[0];
  fullContentSection.insertAdjacentHTML("beforeend", commentsDivHtml);

  window.addEventListener("load", function () {
    document.getElementById("trigger-load-comments").onclick =
      loadDiscourseComments;
  });
}
