/// <reference types="cypress" />

describe('02: Gerenciar Imóveis', () => {
  const timestamp = Date.now();
  const propEmail = `prop_${timestamp}@teste.com`;
  const propPass = '123456';
  const imovelTitulo = `Casa Real ${timestamp}`;
  const imovelEditado = `Casa Editada ${timestamp}`;

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.intercept('POST', '/auth/register').as('register');
    cy.intercept('POST', '/auth/login').as('login');
    cy.intercept('GET', '/imoveis').as('getImoveis'); 
    cy.register(`Proprietario ${timestamp}`, propEmail, '11999999999', propPass, 'PROPRIETARIO');
    cy.login(propEmail, propPass);
  });

  it('deve criar, editar e excluir um imóvel com sucesso', () => {
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').should('be.visible').click(); 
    cy.url().should('include', '/gerenciar-imovel/novo');
    cy.fillCreatePropertyForm(imovelTitulo, 'Florianópolis', '500');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/meus-imoveis');
    cy.wait('@getImoveis'); 
    cy.contains(imovelTitulo, { timeout: 10000 }).should('be.visible');    
    cy.get('[data-testid="btn-editar-0"]').click({ force: true });
    cy.url().should('include', '/gerenciar-imovel');
    cy.get('[data-testid="titulo-header"]').should('contain', imovelTitulo);
    cy.editPropertyTitle(imovelEditado);
    cy.contains('Imóvel atualizado com sucesso').should('be.visible');    
    cy.wait(1000);
    cy.visit('/meus-imoveis');
    cy.wait('@getImoveis'); 
    cy.get('body').then(($body) => {
      if ($body.text().includes(imovelEditado)) {
        cy.log('Imóvel editado encontrado na primeira tentativa.');
      } else {
        cy.log('Dados antigos detectados. Forçando reload...');
        cy.wait(1000);
        cy.reload();
        cy.wait('@getImoveis');
      }
    });
    cy.contains(imovelEditado, { timeout: 10000 }).should('be.visible');    
    cy.get('[data-testid="btn-excluir-0"]').click({ force: true });
    cy.contains('Excluir Imóvel').should('be.visible');
    cy.get('[data-testid="btn-confirmar-exclusao"]').click();
    cy.contains('Imóvel excluído com sucesso').should('be.visible');
    cy.wait('@getImoveis');
    cy.contains(imovelEditado, { timeout: 10000 }).should('not.exist');
  });
});