/// <reference types="cypress" />

Cypress.Commands.add('register', (name, email, phone, password, role = 'CLIENTE') => {
  cy.visit('/cadastro');
  cy.get('[data-testid="register-name"]').should('be.visible').type(name, { force: true });
  cy.get('[data-testid="register-email"]').type(email, { force: true });
  cy.get('[data-testid="register-phone"]').type(phone, { force: true });
  cy.get('[data-testid="register-password"]').type(password, { force: true });
  cy.get('[data-testid="register-confirm-password"]').type(password, { force: true });

  if (role === 'PROPRIETARIO') {
    cy.get('[data-testid="role-proprietario"]').click({ force: true });
  } else {
    cy.get('[data-testid="role-cliente"]').click({ force: true });
  }
  
  cy.get('[data-testid="register-terms"]').click({ force: true });
  cy.get('[data-testid="register-submit"]').click({ force: true });

  cy.contains('Conta criada com sucesso', { timeout: 20000 }).should('be.visible');
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="login-email"]').should('be.visible').clear().type(email, { force: true });
  cy.get('[data-testid="login-password"]').clear().type(password, { force: true });
  cy.get('[data-testid="login-submit"]').click({ force: true });
  cy.get('[data-testid="user-menu-button"]', { timeout: 20000 }).should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu-button"]').click({ force: true });
  cy.get('[data-testid="logout-button"]').click({ force: true });
});

Cypress.Commands.add('goToProfile', () => {
  cy.get('[data-testid="user-menu-button"]').click({ force: true });
  cy.get('[data-testid="profile-link"]').click({ force: true });
});

Cypress.Commands.add('deleteAccount', () => {
  cy.goToProfile();
  cy.get('[data-testid="profile-delete-button"]').scrollIntoView().click({ force: true });
  cy.get('[data-testid="modal-confirm-delete"]').should('be.visible').click({ force: true });
});

Cypress.Commands.add('updateProfile', (newName, newPhone) => {
  cy.get('[data-testid="profile-edit-button"]').click({ force: true });
  cy.get('[data-testid="profile-name-input"]').should('be.visible').clear().type(newName, { force: true });
  cy.get('[data-testid="profile-phone-input"]').clear().type(newPhone, { force: true });
  cy.get('[data-testid="profile-save-button"]').click({ force: true });
  cy.contains('Perfil atualizado com sucesso', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('fillCreatePropertyForm', (titulo, cidade, preco, tipo = 'CASA') => {
  cy.get('[data-testid="imovel-titulo"]', { timeout: 15000 }).should('be.visible').type(titulo, { force: true });
  cy.get('[data-testid="imovel-tipo"]').select(tipo, { force: true });
  cy.get('[data-testid="imovel-endereco"]').type('Rua Teste Cypress, 123', { force: true });
  cy.get('[data-testid="imovel-cidade"]').type(cidade, { force: true });
  cy.get('[data-testid="imovel-preco"]').type(preco, { force: true });
  cy.get('[data-testid="imovel-capacidade"]').type('4', { force: true });
  cy.get('[data-testid="imovel-descricao"]').type('Descrição automatizada real.', { force: true });
  cy.get('[data-testid="imovel-disponivel"]').check({ force: true });
  cy.get('[data-testid="imovel-submit"]').click({ force: true });
});

Cypress.Commands.add('editPropertyTitle', (novoTitulo) => {
  cy.get('[data-testid="btn-ativar-edicao"]').click({ force: true });  
  cy.wait(1000); 
  cy.get('[data-testid="input-titulo"]')
    .should('be.visible')
    .type(`{selectall}{backspace}${novoTitulo}`, { force: true });   
  cy.get('[data-testid="btn-salvar-edicao"]').click({ force: true });
});

Cypress.Commands.add('makeReservation', (daysFromNow, duration) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysFromNow);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration);
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  cy.get('[data-testid="input-checkin"]').clear({ force: true }).type(startStr, { force: true }).blur();
  cy.get('[data-testid="input-checkout"]').clear({ force: true }).type(endStr, { force: true }).blur();
  cy.get('[data-testid="btn-reservar"]').click({ force: true });
});

Cypress.Commands.add('confirmFirstReservation', () => {
  cy.get('[data-testid="tab-pendentes"]').click({ force: true });
  cy.get('[data-testid="btn-confirmar-reserva-0"]').should('be.visible').click({ force: true });
  cy.contains(/Reserva confirmada/i).should('be.visible');
});

Cypress.Commands.add('checkFirstTripStatus', (statusEsperado) => {
  cy.get('[data-testid="status-reserva-0"]').should('contain', statusEsperado);
});

Cypress.Commands.add('submitEvaluation', (stars, comment) => {
  cy.contains('h3', 'Avaliar Hospedagem', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="input-comentario"]', { timeout: 10000 }).should('be.visible');
  cy.get(`[data-testid="star-${stars}"]`).should('exist').click({ force: true });
  cy.get('[data-testid="input-comentario"]').type(comment, { force: true });
  cy.get('[data-testid="btn-enviar-avaliacao"]').click({ force: true });
  cy.contains('Avaliação enviada com sucesso', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('searchByCity', (city) => {
  cy.get('[data-testid="search-city-input"]').should('be.visible').clear().type(city, { force: true });
  cy.get('[data-testid="search-submit-button"]').click({ force: true });
});

Cypress.Commands.add('shouldHaveResults', () => {
  cy.get('[data-testid="search-results-grid"]', { timeout: 10000 }).should('exist');
  cy.get('[data-testid^="result-card-"]').should('have.length.greaterThan', 0);
});

Cypress.Commands.add('shouldHaveNoResults', () => {
  cy.get('[data-testid="no-results-message"]', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('selectGuests', (count) => {
  cy.get('[data-testid="search-guests-select"]').select(String(count), { force: true });
  cy.get('[data-testid="search-submit-button"]').click({ force: true });
});

Cypress.Commands.add('selectDates', (checkin, checkout) => {
  cy.get('[data-testid="search-checkin-input"]').type(checkin, { force: true });
  cy.get('[data-testid="search-checkout-input"]').type(checkout, { force: true });
  cy.get('[data-testid="search-submit-button"]').click({ force: true });
});

Cypress.Commands.add('filterByType', (type) => {
  cy.get(`[data-testid="filter-tipo-${type}"]`).check({ force: true });
  cy.wait(1000);
});

Cypress.Commands.add('filterByPrice', (min, max) => {
  cy.get('[data-testid="filter-preco-min"]').clear({ force: true }).type(min, { force: true });
  cy.get('[data-testid="filter-preco-max"]').clear({ force: true }).type(max, { force: true });
  cy.wait(1000);
});

const COMMAND_DELAY = 100; 
const COMMANDS_TO_SLOW_DOWN = ['click', 'type', 'clear', 'check', 'uncheck', 'select', 'visit', 'reload'] as const;

COMMANDS_TO_SLOW_DOWN.forEach((command) => {
  Cypress.Commands.overwrite(command as keyof Cypress.Chainable, (originalFn, ...args) => {
    const fn = originalFn as (...args: unknown[]) => unknown;
    const origVal = fn(...args);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(origVal);
      }, COMMAND_DELAY); 
    });
  });
});

export {};