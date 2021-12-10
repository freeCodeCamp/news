# Mock testing builds

Follow these steps to build and test the mock website, redirects & other serve
configs:

1. Remember to run all the commands from the root of the project. And also note
   that these commands use Docker Compose v2, which you can swap with v1 if you
   want. That is, instead of `docker compose COMMAND`, you can use the older
   `docker-compose COMMAND` format.

2. Run `npm ci` to install all the dependencies.

3. Copy & create a `.env` file following the contents of the `sample.env` file.
   Most critically, ensure the values of these variables are correct:

   ```
   LOCALE_FOR_GHOST="italian"
   LOCALE_FOR_UI="italian"
   ```

   In this example, we are going to pull posts from the Ghost instance for
   Italian.

4. Run `npm run build` to build the news website.

   This will create a `dist` folder with the built website. This is the exact
   same distribution that we package for production with the GitHub actions
   workflow.

5. Build the containers with compose:

   ```console
   docker compose -f docker-compose.test.yml build --build-arg BUILD_LANGUAGE=dothraki
   ```

   **Note:**

   The build language is deliberately set to `dothraki`.

   So, while you are pulling posts from the Ghost instance, and building the
   website with 11ty for `italian`, you will still be able to visit and test the
   site at URL like so: `http://localhost/dothraki/news`.

   This is a quick way to test the website without having to build the whole
   stack which involves NGINX config changes.

6. Run the containers with compose:

   ```console
   docker compose -f docker-compose.test.yml up
   ```

7. Visit the site at
   [`http://localhost/dothraki/news`](`http://localhost/dothraki/news`).
