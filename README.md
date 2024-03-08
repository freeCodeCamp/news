![freeCodeCamp.org Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)

# Developer News

Welcome to freeCodeCamp's [Developer News][1] codebase — A JAMStack app built with [Ghost][2] & [11ty][3] & lots of love from the community.

The code is based on this [template][4]. We use this project to build and deploy multiple instances of our publications in several world languages. All of the services are then distributed globally by our CDN provider.

## Contributing

**Note:** We limit direct contributions (in the form of pull requests) to this project due to limitations with our QA & deployment workflows.

We welcome you to work on any of our other available open-source projects instead. You can find our contributing guidelines [here][5].

If you found an issue or a bug on this repository, please connect with us in the contributor's chat room first.

Happy Contributing!

## Build

### Deployment Status

You can click on the badges below to go to the dashboards detailing the status of the latest deployments. If you see something is not right, wait for a few hours. Our team is usually on top of these with automated alerts.

| Language     | Status (Click to see details) |
| :----------- | :---------------------------- |
| English      | [![Deployment status][6]][7]  |
| Others(i18n) | [![Deployment status][8]][9]  |

### Build Schedules

New builds to the `/news` sites are triggered as per the below schedule:

| Language     | Schedule (UTC)                                                                    |
| :----------- | :-------------------------------------------------------------------------------- |
| English      | Every 3 Hours - except between UTC 00:00 - UTC 06:00 on Wed & Sat for maintenance |
| Others(i18n) | Every 6 Hours - except between UTC 00:00 - UTC 06:00 on Wed & Sat for maintenance |

**Note: Once a build is triggered, it can take upto an hour to complete, and cascade to all regions in the world.**

### Frequently Asked Questions

#### Where do I check the status of the latest build?

You can check the status of the latest builds by clicking the Deployment Status badge in the previous section.

#### I published an article. Why has it not appeared on news yet?

Your published article and changes may take longer than usual to appear. We also have multiple layers of caching. This helps us to serve the content faster to our users.

When you publish a change, like updating scripts, a new article, updating old articles, adding or updating pages, etc., in Ghost CMS, it will eventually appear on the public-facing site.

It can take up to 1 hour for the changes to appear on the site. If you are still not seeing the changes, please wait for a few hours.

#### I see a build has failed, what should I do?

We recommend giving changes at least a day before reaching out to someone to take a look. We have recovery workflows in place to fix most of the issues.

Also, the team gets alerts for all build failures, etc. You need not alert them again.

## Copyright & License

Copyright (c) 2021 freeCodeCamp.org - Released under the
[BSD 3 license](LICENSE.md).

[1]: https://www.freecodecamp.org/news
[2]: https://ghost.org/
[3]: https://www.11ty.io/
[4]: https://github.com/TryGhost/eleventy-starter-ghost
[5]: https://contribute.freecodecamp.org/#/
[6]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-eng.yml/badge.svg
[7]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-eng.yml
[8]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-i18n.yml/badge.svg
[9]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-i18n.yml
