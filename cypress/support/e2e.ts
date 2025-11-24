import './commands';

beforeEach(() => {
  Cypress.on('uncaught:exception', (err) => {
    console.log('Uncaught exception:', err);
    return false;
  });

  Cypress.config('defaultCommandTimeout', 10000);
  
  cy.intercept('POST', '/api/auth/**').as('authRequest');
  cy.intercept('GET', '/api/user/**').as('userRequest');
  cy.intercept('DELETE', '/api/user/**').as('deleteUserRequest');
});