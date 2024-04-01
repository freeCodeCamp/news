const errorLogger = require('./error-logger');
const fetch = require('node-fetch');
const {
  chatWebhookKey,
  chatWebhookToken,
  eleventyEnv,
  currentLocale_i18n
} = require('../config');

const pingEditorialTeam = async duplicatesArr => {
  const msg = `Posts with duplicate slugs have been found between Ghost and Hashnode. The following posts have been removed from the latest build:
  
${duplicatesArr.map(post => `- "${post.title}" with the slug "/${post.slug}" on the ${currentLocale_i18n.charAt(0).toUpperCase() + currentLocale_i18n.slice(1)} ${post.source} publication`).join('\n')}

Please update the post slugs on either Ghost or Hashnode to include them in future builds.
`;
  console.warn(`
-----------------------------------------------
WARNING: Duplicate Posts Found
-----------------------------------------------
${msg}
`);
  errorLogger({ type: 'duplicate-posts', name: msg });

  try {
    // Prevent sending messages while in dev or CI environments
    if (eleventyEnv === 'dev' || eleventyEnv === 'ci') return;

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
