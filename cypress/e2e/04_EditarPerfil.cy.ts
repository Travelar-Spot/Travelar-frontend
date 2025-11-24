/// <reference types="cypress" />

describe('04: Editar Perfil', () => {
  const timestamp = Date.now();
  const testName = `Usuario Edicao ${timestamp}`;
  const testEmail = `edicao_${timestamp}@travelar.com`;
  const testPhone = '11987654321';
  const testPassword = 'senha123';
  
  const newName = `Nome Atualizado ${timestamp}`;
  const newPhone = '11999998888';

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    cy.register(testName, testEmail, testPhone, testPassword, 'CLIENTE');
    cy.login(testEmail, testPassword);
  });

  it('deve permitir a atualização dos dados do perfil e verificar a persistência', () => {
    cy.goToProfile();
    
    cy.get('[data-testid="profile-name-display"]').should('contain', testName);
    cy.get('[data-testid="profile-phone-display"]').should('contain', testPhone);

    cy.updateProfile(newName, newPhone);
    
    cy.get('[data-testid="profile-name-display"]').should('contain', newName);
    
    cy.reload();
    
    cy.get('[data-testid="profile-name-display"]').should('contain', newName);
    cy.get('[data-testid="profile-phone-display"]').should('contain', newPhone); 
  });
});