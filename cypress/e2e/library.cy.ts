/// <reference types="cypress" />

describe('RegexLibrary', () => {
  beforeEach(() => {
    // Visit the home page and create a pattern before each test
    cy.visit('/');
    
    // Mock the Ollama API
    cy.intercept('POST', '/api/ollama/chat', {
      statusCode: 200,
      body: {
        message: {
          content: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
        },
      },
    }).as('ollamaApi');
    
    // Create a pattern
    cy.get('#description').type('Match email addresses');
    cy.get('button').contains('Generate Pattern').click();
    cy.get('input#name').type('Email Pattern');
    cy.get('input#tags').type('email, validation');
    cy.get('button').contains('Save Pattern').click();
    
    // Navigate to the library page
    cy.contains('Library').click();
  });

  it('displays the library title', () => {
    cy.contains('h1', 'Your RegEx Library').should('exist');
  });

  it('displays saved patterns', () => {
    cy.contains('Email Pattern').should('exist');
    cy.contains('Match email addresses').should('exist');
    cy.contains('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g').should('exist');
  });

  it('displays pattern tags', () => {
    cy.contains('email').should('exist');
    cy.contains('validation').should('exist');
  });

  it('allows filtering patterns by search term', () => {
    // Create a second pattern
    cy.visit('/');
    cy.get('#description').type('Match phone numbers');
    cy.get('button').contains('Generate Pattern').click();
    cy.get('input#name').type('Phone Pattern');
    cy.get('input#tags').type('phone, validation');
    cy.get('button').contains('Save Pattern').click();
    
    // Navigate back to library
    cy.contains('Library').click();
    
    // Both patterns should be visible
    cy.contains('Email Pattern').should('exist');
    cy.contains('Phone Pattern').should('exist');
    
    // Filter by 'email'
    cy.get('[placeholder="Search patterns..."]').type('email');
    
    // Only the email pattern should be visible
    cy.contains('Email Pattern').should('exist');
    cy.contains('Phone Pattern').should('not.exist');
    
    // Clear the search
    cy.get('[placeholder="Search patterns..."]').clear();
    
    // Filter by 'phone'
    cy.get('[placeholder="Search patterns..."]').type('phone');
    
    // Only the phone pattern should be visible
    cy.contains('Email Pattern').should('not.exist');
    cy.contains('Phone Pattern').should('exist');
  });

  it('allows editing a pattern', () => {
    // Click the edit button
    cy.contains('Edit').click();
    
    // The edit form should be displayed - find the input fields
    cy.get('label').contains('Name').next('input').should('exist');
    
    // Change the name and description
    cy.get('label').contains('Name').next('input').clear().type('Updated Email Pattern');
    cy.get('label').contains('Description').next('textarea').clear().type('Updated description');
    
    // Save the changes
    cy.contains('Save Changes').click();
    
    // The updated pattern should be displayed
    cy.contains('Updated Email Pattern').should('exist');
    cy.contains('Updated description').should('exist');
  });

  it('allows deleting a pattern', () => {
    // Mock the window.confirm to return true
    cy.on('window:confirm', () => true);
    
    // Click the delete button
    cy.contains('Delete').click();
    
    // The pattern should no longer be displayed
    cy.contains('Email Pattern').should('not.exist');
    
    // The "empty library" message should be displayed
    cy.contains('Your library is empty').should('exist');
  });
}); 