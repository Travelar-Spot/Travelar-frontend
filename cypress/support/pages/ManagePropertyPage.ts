export default class  ManagePropertyPage {

  goToRegister() {
    cy.contains("a", "Criar conta").click();
  }

  goToLogin() {
    cy.contains("a", "Entrar").click();
  }

  goToProfile() {
    cy.get('[data-testid="header-profile"]').click();
  }

  registerUser(name: string, email: string, phone: string, password: string) {
    cy.get('[data-testid="input-name"]').type(name);
    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-phone"]').type(phone);
    cy.get('[data-testid="input-password"]').type(password);
    cy.get('[data-testid="select-role"]').select("CLIENTE");
    cy.get('[data-testid="btn-register"]').click();
  }

  login(email: string, password: string) {
    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-password"]').type(password);
    cy.get('[data-testid="btn-login"]').click();
  }

  logout() {
    cy.get('[data-testid="header-logout"]').click();
  }

  deleteAccount() {
    cy.get('[data-testid="btn-delete-account"]').click();
    cy.get('[data-testid="confirm-delete"]').click();
  }

  expectToast(message: string) {
    cy.contains('.toast-message', message, { timeout: 8000 }).should('be.visible');
  }

  expectLoggedIn() {
    cy.get('[data-testid="header-logout"]', { timeout: 8000 })
      .should('be.visible');
  }

  expectLoggedOut() {
    cy.get('[data-testid="header-login"]', { timeout: 8000 })
      .should('be.visible');
  }
}
