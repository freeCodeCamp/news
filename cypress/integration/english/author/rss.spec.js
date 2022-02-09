const commonExpectedMeta = require("../../../fixtures/common-expected-meta.json");
const expectedAuthorTitle = `Quincy Larson - ${commonExpectedMeta.siteName}`;

describe("Author page RSS feed", () => {
  let feed;

  // To do: add this as a Cypress plugin in separate PR
  function htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  before(async () => {
    // To do: add this as a Cypress plugin in separate PR
    const parser = new DOMParser();
    const res = await cy.request("/author/quincylarson/rss.xml");
    feed = parser.parseFromString(res.body, "application/xml");
  });

  it(`should have the channel title <![CDATA[ ${expectedAuthorTitle} ]]>`, () => {
    const title = feed.querySelector("channel title").innerHTML.trim();

    expect(title).to.equal(`<![CDATA[ ${expectedAuthorTitle} ]]>`);
  });

  it(`should have the channel description <![CDATA[ ${commonExpectedMeta.description} ]]>`, () => {
    const channelDescription = feed
      .querySelector("channel description")
      .innerHTML.trim();

    expect(channelDescription).to.equal(
      `<![CDATA[ ${commonExpectedMeta.description} ]]>`
    );
  });

  it(`should have the channel link ${commonExpectedMeta.siteUrl}`, () => {
    const channelLink = feed.querySelector("channel link").innerHTML.trim();

    expect(channelLink).to.equal(`${commonExpectedMeta.siteUrl}`);
  });

  it("should have the expected channel image elements and values", () => {
    const channelImageURL = feed
      .querySelector("channel image url")
      .innerHTML.trim();
    const channelImageTitle = htmlDecode(
      feed.querySelector("channel image title").innerHTML.trim()
    );
    const channelImageLink = feed
      .querySelector("channel image link")
      .innerHTML.trim();

    expect(channelImageURL).to.equal(commonExpectedMeta.faviconUrl);
    expect(channelImageTitle).to.equal(expectedAuthorTitle);
    expect(channelImageLink).to.equal(commonExpectedMeta.siteUrl);
  });

  it("should have a channel lastBuildDate that's less than or equal to the current date", () => {
    const lastBuildDate = new Date(
      feed.querySelector("channel lastBuildDate").innerHTML.trim()
    );
    const currDate = new Date();

    expect(lastBuildDate).to.be.lte(currDate);
  });

  it("should have a channel ttl set to 60", () => {
    const channelTTL = feed.querySelector("channel ttl").innerHTML.trim();

    expect(channelTTL).to.equal("60");
  });

  it("should return 15 articles", () => {
    const articles = feed.querySelectorAll("item");

    expect([...articles]).to.have.lengthOf(15);
  });
});
