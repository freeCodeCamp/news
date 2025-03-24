const errorLogger = require('./error-logger');
// const fetch = require('node-fetch');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const {
  chatWebhookKey,
  chatWebhookToken,
  eleventyEnv,
  currentLocale_i18n
} = require('../config');

const pingEditorialTeam = async duplicatesArr => {
  const msg = `Posts / pages with duplicate slugs have been found between Ghost and Hashnode. The following have been removed from the latest build:

${duplicatesArr.map(obj => `- The ${obj.contentType} titled "${obj.title}" with the slug "/${obj.slug}" on the ${currentLocale_i18n.charAt(0).toUpperCase() + currentLocale_i18n.slice(1)} ${obj.source} publication`).join('\n')}

Please update the post / page slugs on either Ghost or Hashnode to include them in future builds.
`;
  process.env['FCC_DISABLE_WARNING'] === 'false' &&
    console.warn(`
-----------------------------------------------
WARNING: Duplicate Post / Page Slugs Found
-----------------------------------------------
${msg}
`);
  errorLogger({ type: 'duplicate-slugs', name: msg });

  // Prevent sending messages while in dev or CI environments
  if (eleventyEnv === 'dev' || eleventyEnv === 'ci') return;

  try {
    const chatWebhookURL = `https://chat.googleapis.com/v1/spaces/AAAAHMCb1fg/messages?key=${chatWebhookKey}&token=${chatWebhookToken}`;
    const res = await fetch(chatWebhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: msg
      })
    });

    return await res.json();
  } catch (err) {
    console.error(`
-----------------------------------------------
Error: Unable to ping the editorial team
-----------------------------------------------

${err}
`);
  }
};

module.exports = pingEditorialTeam;
