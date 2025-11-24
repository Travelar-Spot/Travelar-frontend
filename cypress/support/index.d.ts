/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      register(name: string, email: string, phone: string, password: string, role?: 'CLIENTE' | 'PROPRIETARIO' |'AMBOS'): Chainable<void>;
      login(email: string, password: string, role?: 'CLIENTE' | 'PROPRIETARIO' | 'AMBOS'): Chainable<void>;
      logout(): Chainable<void>;
      goToProfile(): Chainable<void>;
      deleteAccount(): Chainable<void>;
      debugTestIds(): Chainable<void>;
      fillCreatePropertyForm(titulo: string, cidade: string, preco: string, tipo?: string): Chainable<void>;
      editPropertyTitle(novoTitulo: string): Chainable<void>;
      makeReservation(daysFromNow: number, duration: number): Chainable<void>;
      confirmFirstReservation(): Chainable<void>;
      checkFirstTripStatus(status: string): Chainable<void>;
      updateProfile(newName: string, newPhone: string): Chainable<void>;
      submitEvaluation(stars: number, comment: string): Chainable<void>;
      searchByCity(city: string): Chainable<void>;
      shouldHaveResults(): Chainable<void>;
      shouldHaveNoResults(): Chainable<void>;
      selectGuests(count: number): Chainable<void>;
      selectDates(checkin: string, checkout: string): Chainable<void>;
      filterByType(type: string): Chainable<void>;
      filterByPrice(min: string, max: string): Chainable<void>;
    }
  }
}

export {};