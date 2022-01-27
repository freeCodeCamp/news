describe("Landing RSS feed", () => {
  let feed;

  before(async () => {
    // To do: improve RSS tests by using an actual XML parser to
    // select and test specific fields (titles, descriptions,
    // timestamps, etc.)
    const parser = new DOMParser();
    const res = await cy.request("/rss.xml");
    feed = parser.parseFromString(res.body, "application/xml");
  });

  it("should start with the title <![CDATA[ freeCodeCamp.org ]]>", () => {
    const title = feed.querySelector("channel title").innerHTML.trim();

    expect(title).to.equal("<![CDATA[ freeCodeCamp.org ]]>");
  });

  it("should return 10 articles", () => {
    const articles = feed.querySelectorAll("item");

    expect([...articles]).to.have.lengthOf(10);
  });
});
