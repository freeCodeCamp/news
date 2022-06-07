![freeCodeCamp.org Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)

# Developer News

Welcome to freeCodeCamp's [Developer News][1] codebase — A JAMStack app built with [Ghost][2] & [11ty][3] & lots of love from the community.

The code is based on this [template][4]. We use this project to build and deploy multiple instances of our publications in several world languages.

Content is fetched from Ghost, packaged into docker images, and deployed to Azure WebApp for Containers on Azure App Service.

All of the services are then distributed globally by our CDN provider.

## Contributing

**Note:** We limit direct contributions (in the form of pull requests) to this project due to limitations with our QA & deployment workflows.

We welcome you to work on any of our other available open-source projects instead. You can find our contributing guidelines [here][5].

If you found an issue or a bug on this repository, please connect with us in the contributor's chat room first.

Happy Contributing!

## Build Status

| Language | Status                                                                                                                                                                                                  |
| :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| English  | [![Build status](https://dev.azure.com/freeCodeCamp-org/news/_apis/build/status/build-deploy-eng)](https://dev.azure.com/freeCodeCamp-org/news/_build/latest?definitionId=31)                           |
|  Others  | [![Build and Deploy Localized News to Azure](https://github.com/freeCodeCamp/news/actions/workflows/deploy-i18n.yml/badge.svg)](https://github.com/freeCodeCamp/news/actions/workflows/deploy-i18n.yml) |

## Copyright & License

Copyright (c) 2021 freeCodeCamp.org - Released under the
[BSD 3 license](LICENSE.md).

[1]: https://www.freecodecamp.org/news
[2]: https://ghost.org/
[3]: https://www.11ty.io/
[4]: https://github.com/TryGhost/eleventy-starter-ghost
[5]: https://contribute.freecodecamp.org/#/
