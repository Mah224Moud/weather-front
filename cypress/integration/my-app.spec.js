describe('My App', () => {
    it('should load the homepage', () => {
      cy.visit('http://localhost:4200');
      cy.contains('Welcome to My App');
    });
  });