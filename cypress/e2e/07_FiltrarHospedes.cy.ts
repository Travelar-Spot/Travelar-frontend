/// <reference types="cypress" />

describe('07: Filtrar Busca por Hóspedes', () => {
  const timestamp = Date.now();
  const hostEmail = `host_hospedes_${timestamp}@teste.com`;
  const hostPass = '123456';
  const city = 'CidadeDosHospedes';
  const imovelTitulo = `Imóvel Pequeno ${timestamp}`;

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('deve filtrar imóveis adequados ao número de hóspedes selecionado', () => {
    cy.register(`Host Hospedes ${timestamp}`, hostEmail, '11999999999', hostPass, 'PROPRIETARIO');
    cy.login(hostEmail, hostPass);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').should('be.visible').click();
    cy.fillCreatePropertyForm(imovelTitulo, city, '100');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.contains(imovelTitulo).should('be.visible');
    cy.logout();
    cy.visit('/');
    cy.searchByCity(city);
    cy.shouldHaveResults();
    cy.selectGuests(1);
    cy.shouldHaveResults();
    cy.get('[data-testid="search-results-title"]').should('contain', 'encontrada');
    cy.selectGuests(8);
    cy.shouldHaveNoResults();
    cy.contains('Nenhum imóvel encontrado').should('be.visible');
    cy.selectGuests(2);
    cy.shouldHaveResults();
    cy.get('[data-testid="search-results-title"]').should('contain', 'encontrada');
  });
});