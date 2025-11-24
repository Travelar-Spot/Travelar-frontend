

describe('01: Gerenciar Ciclo de Vida da Conta', () => {
  const timestamp = Date.now();
  const testName = `Usuario Ciclo ${timestamp}`;
  const testEmail = `ciclo_${timestamp}@travelar.com`;
  const testPhone = '11987654321';
  const testPassword = 'senha123';

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('deve realizar o fluxo completo: Cadastro -> Login -> Logout -> Login -> Exclusão', () => { 
    cy.register(testName, testEmail, testPhone, testPassword);
    cy.url().should('include', '/login');
    cy.login(testEmail, testPassword);
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.logout();
    cy.login(testEmail, testPassword);
    cy.deleteAccount();    
    cy.url().should('not.include', '/meu-perfil');
    cy.contains(/Login|Entre na sua conta/i).should('be.visible');
  });
});