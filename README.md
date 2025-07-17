![freeCodeCamp.org Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)

# Developer News

Welcome <Ruslanna> to freeCodeCamp's [Developer News][1] codebase — A JAMStack app built with [Hashnode][2], [11ty][3], and lots of love from the community. We use this project to build and deploy multiple instances of our publications in several world languages. All of the services are then distributed globally by our CDN.

## Contributing

We limit contributions to this specific repository because of the complexities of our deployment and QA processes. We welcome you to work on any of our other open-source projects. You can find our contributing [guidelines here][5].

If you have found an issue or a bug in this repository, please connect with us in the [contributor's chat room][6] first.

Happy Contributing!

## Builds and Deployments

### Build

We use GHA to build the news sites. Workflows are in the `.github/workflows` directory.

### Build Schedules

New builds to the `/news` sites are triggered according to the schedule below:

| Language     | Schedule (UTC)                                                                    |
| :----------- | :-------------------------------------------------------------------------------- |
| English      | Every 3 Hours - except between UTC 00:00 - UTC 06:00 on Wed & Sat for maintenance |
| Others(i18n) | Every 6 Hours - except between UTC 00:00 - UTC 06:00 on Wed & Sat for maintenance |

> [!Important]
> Once a build is triggered, it can take up to an hour to complete and cascade to all regions in the world.

### Deployment

We deploy the news sites on a private [Docker Swarm cluster](https://github.com/freeCodeCamp/news-docker-swarm-config).

### Deployment Status

You can click on the badges below to go to the dashboards detailing the status of the latest deployments. If you see something is not right, wait for a few hours. Our team is usually on top of these with automated alerts.

| Language     | Status (Click to see details)                                     |
| :----------- | :---------------------------------------------------------------- |
| English      | [![Deployment status][7]][8] 👈 Yes – you can click these things! |
| Others(i18n) | [![Deployment status][9]][10]                                     |

## Frequently Asked Questions

#### Where can I check the status of the latest build?

You can check the status of the latest builds by clicking the Deployment Status badge in the previous section.

#### I published an article. Why hasn't it appeared on the news site yet?

Your published article and changes may take longer than usual to appear. We have multiple layers of caching, which helps us serve content faster to our users.

When you publish a change in CMS (such as updating scripts, adding a new article, updating old articles, or adding/updating pages), it will eventually appear on the public-facing site.

Sometimes, it can take up to an hour after the build is completed for the changes to appear on the site.

#### I see a build has failed. What should I do?

We recommend waiting at least a day before reaching out to someone to investigate. We have recovery workflows in place to fix most issues automatically.

Additionally, the team receives alerts for all build failures. There's no need for you to alert them again - unless it's been more than a day since the build failed.

## Copyright & License

Copyright (c) 2021 freeCodeCamp.org - Released under the
[BSD 3 license](LICENSE.md).

[1]: https://www.freecodecamp.org/news
[2]: https://hashnode.com
[3]: https://www.11ty.io
[4]: https://github.com/TryGhost/eleventy-starter-ghost
[5]: https://contribute.freecodecamp.org
[6]: https://chat.freecodecamp.org
[7]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-eng.yml/badge.svg
[8]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-eng.yml
[9]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-i18n.yml/badge.svg
[10]: https://github.com/freeCodeCamp/news/actions/workflows/deploy-i18n.yml
