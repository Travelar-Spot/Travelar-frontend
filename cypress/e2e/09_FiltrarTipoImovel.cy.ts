/// <reference types="cypress" />

describe('09: Filtrar Imóveis por Tipo', () => {
  const timestamp = Date.now();
  const hostEmail = `host_tipos_${timestamp}@teste.com`;
  const hostPass = '123456';
  const city = `CidadeTipos${timestamp}`;

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

 it('deve filtrar imóveis corretamente por tipo (Casa, Apartamento, etc)', () => {
    cy.register(`Host Tipos ${timestamp}`, hostEmail, '11999999999', hostPass, 'PROPRIETARIO');
    cy.login(hostEmail, hostPass);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').first().click({ force: true });
    cy.fillCreatePropertyForm(`Minha Casa ${timestamp}`, city, '200', 'CASA');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').first().click({ force: true });
    cy.fillCreatePropertyForm(`Meu Ape ${timestamp}`, city, '300', 'APARTAMENTO');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.logout();
    cy.visit('/');
    cy.searchByCity(city);
    cy.shouldHaveResults();
    cy.contains(`Minha Casa ${timestamp}`).should('be.visible');
    cy.contains(`Meu Ape ${timestamp}`).should('be.visible');
    cy.filterByType('APARTAMENTO');
    cy.contains(`Meu Ape ${timestamp}`).should('be.visible');
    cy.contains(`Minha Casa ${timestamp}`).should('not.exist');
    cy.get('[data-testid="filter-tipo-APARTAMENTO"]').uncheck({ force: true });
    cy.filterByType('CASA');
    cy.contains(`Minha Casa ${timestamp}`).should('be.visible');
    cy.contains(`Meu Ape ${timestamp}`).should('not.exist');
    cy.get('[data-testid="filter-tipo-CASA"]').uncheck({ force: true });
    cy.filterByType('CHACARA');
    cy.shouldHaveNoResults();
    cy.contains('Nenhum imóvel encontrado').should('be.visible');
  });
});