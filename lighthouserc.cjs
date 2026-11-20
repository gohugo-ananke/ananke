module.exports = {
  ci: {
    collect: {
      startServerCommand: "node tests/support/dev-server.mjs",
      startServerReadyPattern: "Fixture site served",
      url: [
        "http://localhost:4321/",
        "http://localhost:4321/posts/",
        "http://localhost:4321/posts/hello/",
      ],
      numberOfRuns: 3,
      settings: { chromeFlags: "--no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 16384 }],
        "resource-summary:stylesheet:size": [
          "error",
          { maxNumericValue: 32768 },
        ],
      },
    },
    upload: { target: "filesystem", outputDir: "tests/.playwright/lighthouse" },
  },
};
