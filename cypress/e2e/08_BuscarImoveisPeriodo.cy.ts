/// <reference types="cypress" />

describe('08: Buscar Imóveis por Período', () => {
  const timestamp = Date.now();
  const hostEmail = `host_dates_${timestamp}@test.com`;
  const hostPass = '123456';
  const city = 'CidadeDasDatas';
  const imovelTitulo = `Casa Temporada ${timestamp}`;

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('deve permitir selecionar datas de check-in e check-out e refletir na busca', () => {
    cy.register(`Host Dates ${timestamp}`, hostEmail, '11999999999', hostPass, 'PROPRIETARIO');
    cy.login(hostEmail, hostPass);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').should('be.visible').click();
    cy.fillCreatePropertyForm(imovelTitulo, city, '150');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.contains(imovelTitulo).should('be.visible');
    cy.logout();
    cy.visit('/');

    const today = new Date();
    const dateCheckin = new Date(today);
    dateCheckin.setDate(today.getDate() + 5);
    const strCheckin = dateCheckin.toISOString().split('T')[0];
    const dateCheckout = new Date(today);
    dateCheckout.setDate(today.getDate() + 10);
    const strCheckout = dateCheckout.toISOString().split('T')[0];

    cy.searchByCity(city); 
    cy.selectDates(strCheckin, strCheckout);     
    cy.shouldHaveResults();
    cy.contains(imovelTitulo).should('be.visible');
  });
});