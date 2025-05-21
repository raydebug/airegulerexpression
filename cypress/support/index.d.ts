/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to get an element by selector or text content.
     * @example cy.contains('Submit')
     */
    contains(content: string | number | RegExp): Chainable<Element>;
    contains(selector: string, content: string | number | RegExp): Chainable<Element>;
  }
} 