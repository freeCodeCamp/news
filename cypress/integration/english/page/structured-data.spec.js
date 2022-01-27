describe("Page structured data (JSON-LD)", () => {
  const commonExpectedJsonLd = require("../../../fixtures/common-expected-json-ld.json");
  const pageExpectedJsonLd = {
    "@type": "Article",
    author: {
      "@type": "Person",
      name: "freeCodeCamp.org",
      image: {
        "@type": "ImageObject",
        url: "https://www.freecodecamp.org/news/content/images/2021/05/freecodecamp-org-gravatar.jpeg",
        width: 250,
        height: 250,
      },
      url: "http://localhost:8080/news/author/freecodecamp/",
      sameAs: [],
    },
    headline:
      "Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.",
    url: "http://localhost:8080/news/thank-you-for-donating/",
    datePublished: "2020-03-16T17:03:46.000Z",
    dateModified: "2021-11-18T09:16:21.000Z",
    image: {
      "@type": "ImageObject",
      url: "https://www.freecodecamp.org/news/content/images/2020/03/fcc-banner.jpg",
      width: 1500,
      height: 500,
    },
    description:
      "Once you&#x27;ve forwarded this receipt, we will award you with your donor badge on\nyour freeCodeCamp profile. We will also turn off donation prompts for you.\n\nThank you again for supporting our nonprofit.\n\nfreeCodeCamp is a highly-efficient education NGO. This year alone, we&#x27;ve\nprovided million hours of free education to people around the world.\n\nAt our nonprofit&#x27;s current operating budget, every dollar you donate to\nfreeCodeCamp translates into 50 hours worth of technology education.\n\nSome members ",
  };
  let jsonLdObj;

  before(() => {
    cy.visit("/thank-you-for-donating");

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then(($script) => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it("matches the expected base values", () => {
    expect(jsonLdObj["@context"]).to.equal(commonExpectedJsonLd["@context"]);
    expect(jsonLdObj["@type"]).to.equal(pageExpectedJsonLd["@type"]);
    expect(jsonLdObj.url).to.equal(pageExpectedJsonLd.url);
    expect(jsonLdObj.datePublished).to.equal(pageExpectedJsonLd.datePublished);
    expect(jsonLdObj.dateModified).to.equal(pageExpectedJsonLd.dateModified);
    expect(jsonLdObj.description).to.equal(pageExpectedJsonLd.description);
    expect(jsonLdObj.headline).to.equal(pageExpectedJsonLd.headline);
  });

  it("matches the expected publisher values", () => {
    expect(jsonLdObj.publisher).to.deep.equal(commonExpectedJsonLd.publisher);
  });

  it("matches the expected image values", () => {
    expect(jsonLdObj.image).to.deep.equal(pageExpectedJsonLd.image);
  });

  it("matches the expected mainEntityOfPage values", () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.mainEntityOfPage
    );
  });

  it("matches the expected author values", () => {
    expect(jsonLdObj.author).to.deep.equal(pageExpectedJsonLd.author);
  });
});
