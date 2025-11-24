/// <reference types="cypress" />

describe('10: Filtrar Imóveis por Faixa de Preço', () => {
  const timestamp = Date.now();
  const hostEmail = `host_price_${timestamp}@teste.com`;
  const hostPass = '123456';
  const city = `CidadePrecos${timestamp}`;

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

it('deve exibir apenas imóveis dentro da faixa de preço selecionada', () => {
    cy.register(`Host Price ${timestamp}`, hostEmail, '11999999999', hostPass, 'PROPRIETARIO');
    cy.login(hostEmail, hostPass);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').first().click({ force: true });
    cy.fillCreatePropertyForm(`Imóvel Econômico ${timestamp}`, city, '100');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').first().click({ force: true });
    cy.fillCreatePropertyForm(`Imóvel de Luxo ${timestamp}`, city, '500');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.logout();
    cy.visit('/');
    cy.searchByCity(city);
    cy.shouldHaveResults();
    cy.contains(`Imóvel Econômico ${timestamp}`).should('be.visible');
    cy.contains(`Imóvel de Luxo ${timestamp}`).should('be.visible');
    cy.filterByPrice('0', '200'); 
    cy.contains(`Imóvel Econômico ${timestamp}`).should('be.visible');
    cy.contains(`Imóvel de Luxo ${timestamp}`).should('not.exist');
    cy.filterByPrice('400', '600');
    cy.contains(`Imóvel de Luxo ${timestamp}`).should('be.visible');
    cy.contains(`Imóvel Econômico ${timestamp}`).should('not.exist');
    cy.filterByPrice('1000', '2000');
    cy.shouldHaveNoResults();
    cy.contains('Nenhum imóvel encontrado').should('be.visible');
  });
});