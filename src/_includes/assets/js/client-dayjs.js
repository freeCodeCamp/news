/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", () => {
  // Load dayjs plugins and set locale
  dayjs.extend(dayjs_plugin_localizedFormat);
  dayjs.extend(dayjs_plugin_relativeTime);
  dayjs.locale("{{ site.lang | lower }}");
});
