import { Given, When, Then, DataTable } from "@badeball/cypress-cucumber-preprocessor";

// Background steps
Given("I have saved a pattern with:", (dataTable: DataTable) => {
  // Get the pattern data from the table
  const patternData = dataTable.rowsHash();
  
  // Visit the home page
  cy.visit("/");
  
  // Mock the Ollama API
  cy.intercept("POST", "/api/ollama/chat", {
    statusCode: 200,
    body: {
      message: {
        content: String(patternData.pattern),
      },
    },
  }).as("ollamaApi");
  
  // Enter the description
  cy.get("#description").clear().type(String(patternData.description), { force: true });
  
  // Generate the pattern
  cy.get("button").contains("Generate Pattern").click();
  
  // Wait for the pattern to be generated
  cy.get("input#pattern").should("exist");
  
  // Enter the name
  cy.get("input#name").clear().type(String(patternData.name), { force: true });
  
  // Enter the tags
  cy.get("input#tags").clear().type(String(patternData.tags), { force: true });
  
  // Save the pattern
  cy.get("button").contains("Save Pattern").click();
});

Given("I am on the library page", () => {
  cy.contains("Library").click();
});

Given("I have also saved a pattern with:", (dataTable: DataTable) => {
  // Get the pattern data from the table
  const patternData = dataTable.rowsHash();
  
  // Visit the home page
  cy.visit("/");
  
  // Mock the Ollama API with the new pattern
  cy.intercept("POST", "/api/ollama/chat", {
    statusCode: 200,
    body: {
      message: {
        content: String(patternData.pattern),
      },
    },
  }).as("ollamaApi");
  
  // Enter the description
  cy.get("#description").clear().type(String(patternData.description), { force: true });
  
  // Generate the pattern
  cy.get("button").contains("Generate Pattern").click();
  
  // Wait for the pattern to be generated
  cy.get("input#pattern").should("exist");
  
  // Enter the name
  cy.get("input#name").clear().type(String(patternData.name), { force: true });
  
  // Enter the tags
  cy.get("input#tags").clear().type(String(patternData.tags), { force: true });
  
  // Save the pattern
  cy.get("button").contains("Save Pattern").click();
  
  // Navigate back to the library page
  cy.contains("Library").click();
});

When("I search for {string}", (searchTerm) => {
  cy.get('[placeholder="Search patterns..."]').clear().type(searchTerm, { force: true });
});

When("I clear the search", () => {
  cy.get('[placeholder="Search patterns..."]').clear();
});

Then("I should not see a pattern named {string}", (name) => {
  cy.contains(name).should("not.exist");
});

Then("I should see the description {string}", (description) => {
  cy.contains(description).should("exist");
});

Then("I should see the pattern {string}", (pattern) => {
  // Handle the escaped backslashes in the regex pattern
  const displayPattern = pattern.replace(/\\\\/g, '\\');
  cy.contains('.break-all', displayPattern).should("exist");
});

Then("I should see the tag {string}", (tag) => {
  cy.contains(tag).should("exist");
});

When("I click the {string} button for {string}", (buttonText, patternName) => {
  // Find the pattern container and click the button within it
  cy.contains(patternName)
    .parents(".rounded-lg")
    .contains(buttonText)
    .click();
});

When("I change the name to {string}", (newName) => {
  cy.get('label').contains('Name').next('input').clear().type(newName, { force: true });
});

When("I change the description to {string}", (newDescription) => {
  cy.get('label').contains('Description').next('textarea').clear().type(newDescription, { force: true });
});

When("I confirm the deletion", () => {
  // Cypress automatically accepts window.confirm dialogs
  cy.on("window:confirm", () => true);
});

Then("I should see the message {string}", (message) => {
  cy.contains(message).should("exist");
}); 