/// <reference types="cypress" />

describe('03: Gerenciar Reservas', () => {
  const timestamp = Date.now();
  const hostEmail = `host_${timestamp}@teste.com`;
  const clientEmail = `client_${timestamp}@teste.com`;
  const password = 'senha123';
  const imovelTitulo = `Imovel Reserva ${timestamp}`;
  let imovelUrl = '';

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('deve permitir o fluxo de reserva: Cliente pede -> Anfitrião aceita', () => {
    cy.register(`Host ${timestamp}`, hostEmail, '11999999999', password, 'PROPRIETARIO');
    cy.login(hostEmail, password); 
    cy.get('[data-testid="user-menu-button"]').click();
    cy.contains('a', 'Torne-se um anfitrião').click();
    cy.fillCreatePropertyForm(imovelTitulo, 'Curitiba', '250');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.contains(imovelTitulo).click();
    cy.url().should('match', /\/imoveis\/\d+/);
    cy.url().then((url) => {
      imovelUrl = url;
    });
    cy.logout();
    cy.register(`Client ${timestamp}`, clientEmail, '11988888888', password, 'CLIENTE');
    cy.login(clientEmail, password);
    cy.then(() => {
    cy.visit(imovelUrl);
    });
    cy.makeReservation(2, 3);
    cy.contains('Solicitação de reserva enviada').should('be.visible');
    cy.url().should('include', '/minhas-viagens');
    cy.checkFirstTripStatus('PENDENTE');
    cy.logout();
    cy.login(hostEmail, password);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.contains('a', 'Gerenciar Reservas').click();
    cy.url().should('include', '/reservas-anfitriao');
    cy.confirmFirstReservation();
    cy.logout();
    cy.login(clientEmail, password);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.contains('a', 'Minhas Viagens').click();
    cy.checkFirstTripStatus('CONFIRMADA');
  });
});