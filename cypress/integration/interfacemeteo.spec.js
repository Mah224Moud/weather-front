describe('InterfacemeteoComponent', () => {
  
    beforeEach(() => {
      cy.visit('http://localhost:4200/interfacemeteo');
    });
  
    it('should display the component correctly', () => {
      cy.get('app-interfacemeteo').should('exist');
    });
  
    it('should load total when component is initialized', () => {
     cy.intercept('GET', '**/count', {
       statusCode: 200,
        body: 4926041
      }).as('getTotal');
      cy.visit('http://localhost:4200/interfacemeteo');
      cy.wait('@getTotal');
      cy.get('h2').should('contain.text', '4,926,041');
    });
  
    it('pour les villes et suggestions', () => {
      cy.intercept('GET', '**/localisations').as('getCities');
      cy.visit('http://localhost:4200/interfacemeteo');
      cy.wait('@getCities');
      cy.get('input[placeholder="Rechercher une ville..."]').clear();
      cy.get('input[placeholder="Rechercher une ville..."]').type('AE');
      cy.get('.suggestions-container').should('be.visible');
      cy.get('.suggestion-item').should('have.length', 4);
      cy.get('.suggestion-item').should('contain', 'LE RAIZET AERO');
    });
    
    it('ca doit verifier si les coordonnée de la ville saffiche et la card' , ()=>{
      cy.intercept('GET', '**/localisations').as('getCities');
      cy.visit('http://localhost:4200/interfacemeteo');
      cy.wait('@getCities');

      cy.get('.weather-card div:nth-child(1) span.fw-bold').should('have.text', 'DIJON-LONGVIC');
      cy.get('.weather-card div:nth-child(2) span.fw-bold').should('have.text', '7280');
      cy.get('.weather-card div:nth-child(3) span.fw-bold a')
        .should('have.text', ' 47.267834, 5.088333 ')
        .and('have.attr', 'href', 'https://www.google.com/maps?q=47.267834,5.088333')
        .and('have.attr', 'target', '_blank')
        .and('have.css', 'color', 'rgb(0, 0, 255)')
    }); 

    it('verifier le nombre des cards' , () => {
      cy.intercept('GET', '**/localisations').as('getCities');
      cy.visit('http://localhost:4200/interfacemeteo');
      cy.wait('@getCities');
    cy.get('.weather-card').should('be.visible');
    cy.get('.weather-grid .weather-card').should('have.length', 7);
    });

    it('should fetch and verify climatic data from API', () => {
    cy.intercept('GET', '**/donnees-climatiques').as('getDates');
    cy.visit('http://localhost:4200/interfacemeteo');
    cy.get('input[type="date"]').should('have.class', 'ng-untouched');
    cy.get('input[type="date"]').click();
    cy.get('input[type="date"]').blur();
    cy.get('input[type="date"]').should('have.class', 'ng-touched');
    cy.get('input[type="date"]').clear().type('2025-02-02') ;   
    cy.get('input[type="date"]').should('have.class', 'ng-valid');
    cy.get('input[type="date"]').should('have.value', '2025-02-02');
    cy.get('input[type="date"]')
      .clear()
      .type('2025-02-02'); 
    });
    
  });
  