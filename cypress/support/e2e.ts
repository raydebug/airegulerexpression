// Import commands.ts using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ensure that global Cypress types are available
/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

// Add support for Cucumber step definitions
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';

// Mock the Ollama API for all tests
beforeEach(() => {
  // Intercept any POST requests to the Ollama API
  cy.intercept('POST', '**/api/ollama/chat', {
    statusCode: 200,
    body: {
      message: {
        content: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
      },
    },
  }).as('ollamaApi');

  // Intercept any POST requests to the local Ollama service
  cy.intercept('POST', '**/v1/chat/completions', {
    statusCode: 200,
    body: {
      message: {
        content: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
      },
    },
  }).as('ollamaLocalApi');
}); 