/// <reference types="cypress" />

describe('06: Buscar Imóveis por Cidade', () => {
  const timestamp = Date.now();
  const hostEmail = `host_search_${timestamp}@teste.com`;
  const hostPass = '123456';
  const city = 'Gramado';
  const imovelTitulo = `Chalé na Serra ${timestamp}`;

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('deve encontrar imóveis por cidade e exibir mensagem quando não encontrar', () => {
    cy.register(`Host Search ${timestamp}`, hostEmail, '11999999999', hostPass, 'PROPRIETARIO');
    cy.login(hostEmail, hostPass);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').should('be.visible').click();
    cy.fillCreatePropertyForm(imovelTitulo, city, '250');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.contains(imovelTitulo).should('be.visible');
    cy.logout();
    cy.visit('/');
    cy.searchByCity(city);
    cy.url().should('include', '/buscar');
    cy.url().should('include', `cidade=${city}`);
    cy.shouldHaveResults();
    cy.get('[data-testid="search-results-title"]').should('contain', 'encontrada');
    cy.contains(imovelTitulo).should('be.visible');
    cy.get('a[href="/"]').first().click();
    cy.searchByCity('CidadeInexistenteXYZ');
    cy.shouldHaveNoResults();
    cy.contains('Nenhum imóvel encontrado').should('be.visible');
  });
});