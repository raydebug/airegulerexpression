import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Background steps
Given("I am on the homepage", () => {
  cy.visit("/");
});

Given("the Ollama API is available", () => {
  cy.intercept("POST", "/api/ollama/chat", {
    statusCode: 200,
    body: {
      message: {
        content: "/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g",
      },
    },
  }).as("ollamaApi");
});

// Common steps
When("I click the {string} button", (buttonText: string) => {
  cy.contains("button", buttonText).click();
});

// Specific steps
Then("I should see the title {string}", (title: string) => {
  cy.contains("h1", title).should("exist");
});

When("I enter {string} in the description field", (description: string) => {
  cy.get("#description").clear().type(description, { force: true });
});

Then("the description field should contain {string}", (description: string) => {
  cy.get("#description").should("have.value", description);
});

Then("I should see a generated regex pattern", () => {
  cy.get("input#pattern").should("exist");
  cy.get("input#pattern").should("have.value", "/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g");
});

Given("I have generated a regex pattern for {string}", (description: string) => {
  cy.get("#description").clear().type(description);
  cy.contains("button", "Generate Pattern").click();
  cy.get("input#pattern").should("exist");
  cy.get("input#pattern").should("have.value", "/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g");
});

When("I enter {string} in the test field", (testText: string) => {
  cy.get("#test").clear().type(testText, { force: true });
});

When("I enter {string} in the name field", (name: string) => {
  cy.get("input#name").clear().type(name, { force: true });
});

When("I enter {string} in the tags field", (tags: string) => {
  cy.get("input#tags").clear().type(tags, { force: true });
});

Then("I should see the match {string}", (match: string) => {
  cy.contains(match).should("exist");
});

When("I navigate to the library page", () => {
  cy.contains("Library").click();
});

Then("I should see a pattern named {string}", (name: string) => {
  cy.contains(name).should("exist");
});

Then("I should see {int} matches", (count: number) => {
  cy.contains(`Matches (${count})`).should("exist");
});

Then("I should see no matches", () => {
  cy.contains("Matches").should("not.exist");
});

When("I manually edit the pattern to {string}", (pattern: string) => {
  // Wait for the pattern input to be available and stable
  cy.get("input#pattern").should("be.visible");
  cy.get("input#pattern").clear({ force: true });
  cy.wait(500); // Add a small delay
  cy.get("input#pattern").should("be.visible").type(pattern, { force: true });
});

Then("I should not see the match {string}", (match: string) => {
  cy.contains(match).should("not.exist");
});

Given("the Ollama API returns an error", () => {
  cy.intercept("POST", "/api/ollama/chat", {
    statusCode: 500,
    body: {
      error: "Internal server error"
    }
  }).as("ollamaApiError");
});

Then("I should see an error message {string}", (message: string) => {
  cy.contains(message).should("exist");
}); 