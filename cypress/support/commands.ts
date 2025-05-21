// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Add custom commands here

// Mock Ollama API response
Cypress.Commands.add('mockOllamaApi', () => {
  cy.intercept('POST', '/api/ollama/chat', {
    statusCode: 200,
    body: {
      message: {
        content: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
      },
    },
  }).as('ollamaApi');
});

// Create a regular expression pattern
Cypress.Commands.add('createRegexPattern', (description: string, name: string, tags: string) => {
  // Enter the description
  cy.get('#description').type(description);
  
  // Click the generate button
  cy.get('button').contains('Generate Pattern').click();
  
  // Wait for the pattern to be generated
  cy.get('input#pattern').should('exist');
  
  // Enter a name for the pattern
  cy.get('input#name').type(name);
  
  // Enter tags for the pattern
  cy.get('input#tags').type(tags);
  
  // Save the pattern
  cy.get('button').contains('Save Pattern').click();
});

// Declare Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      mockOllamaApi(): Chainable<void>
      createRegexPattern(description: string, name: string, tags: string): Chainable<void>
    }
  }
} 