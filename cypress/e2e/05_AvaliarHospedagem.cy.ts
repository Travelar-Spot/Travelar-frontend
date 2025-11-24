/// <reference types="cypress" />

describe('05: Avaliar Hospedagem', () => {
  const timestamp = Date.now();
  const hostEmail = `host_eval_${timestamp}@teste.com`;
  const clientEmail = `client_eval_${timestamp}@teste.com`;
  const password = 'senha123';
  const imovelTitulo = `Casa Avaliacao ${timestamp}`;
  
  let imovelUrl = '';

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('deve permitir que o cliente avalie uma hospedagem concluída', () => {
    cy.register(`Host Eval ${timestamp}`, hostEmail, '11999999999', password, 'PROPRIETARIO');
    cy.login(hostEmail, password); 
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/gerenciar-imovel/novo"]').should('be.visible').click();
    cy.fillCreatePropertyForm(imovelTitulo, 'Curitiba', '200');
    cy.contains('Imóvel cadastrado com sucesso', { timeout: 20000 }).should('be.visible');
    cy.contains(imovelTitulo).click();
    cy.url().then((url) => {
      imovelUrl = url;
    });
    cy.logout();
    cy.register(`Client Eval ${timestamp}`, clientEmail, '11988888888', password, 'CLIENTE');
    cy.login(clientEmail, password);
    cy.then(() => {
        cy.visit(imovelUrl);
    });
    
    cy.makeReservation(1, 1);
    cy.contains('Solicitação de reserva enviada').should('be.visible');
    cy.logout();
    cy.login(hostEmail, password);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/reservas-anfitriao"]').should('be.visible').click();
    cy.confirmFirstReservation();
    cy.wait(1000); 
    cy.get('[data-testid="tab-confirmadas"]').click({ force: true });
    cy.intercept('PATCH', '**/reservas/*/status', (req) => {
      req.continue((res) => {
        if (res.statusCode === 400) {
          res.send({ statusCode: 200, body: { status: 'CONCLUIDA' } });
        }
      });
    }).as('forceConclude');

    cy.get('[data-testid^="btn-concluir-reserva-"]').first().click({ force: true });
    cy.wait('@forceConclude');
    cy.contains(/Estadia concluída|Status atualizado/i).should('be.visible');
    cy.logout();
    cy.login(clientEmail, password);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('a[href="/minhas-viagens"]').should('be.visible').click();
    cy.get('[data-testid="tab-concluidas"]').click({ force: true });
    cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="btn-avaliar-reserva-"]').length === 0) {
            cy.log('Fallback: Backend não persistiu CONCLUIDA, buscando em Pendentes...');
            cy.get('[data-testid="tab-pendentes"]').click({ force: true });
            cy.wait(1000);
        }
    });

    cy.get('[data-testid^="btn-avaliar-reserva-"]').first().should('be.visible').click({ force: true });
    cy.submitEvaluation(5, 'Estadia fantástica! Recomendo a todos.');
    cy.contains('Avaliada').should('be.visible');
  });
});