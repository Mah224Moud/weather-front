import { AromeComponent } from './arome.component';
import { mount } from 'cypress/angular'; // Cypress Angular testing utility

describe('AromeComponent', () => {
  it('should create the component', () => {
    // Monter le composant Arome
    mount(AromeComponent);
    
    // Vérifie que le composant a bien été monté
    cy.get('app-arome').should('exist');
  });

  it('should initialize the map correctly', () => {
    // On monte le composant
    mount(AromeComponent);
    
    // Vérifie que la carte Leaflet a bien été initialisée
    cy.window().then((window) => {
      const map = window.L.map;
      expect(map).to.have.been.calledWith('map', jasmine.any(Object));  // On vérifie que L.map a été appelé avec les bons paramètres
    });
  });

  it('should load WMS layer correctly', () => {
    // Mock de la fonction `fetch` pour éviter l'appel réel
    cy.intercept('GET', '**/GetMap?*', {
      statusCode: 200,
      body: new Blob(['image data'], { type: 'image/png' }),
    }).as('fetchWMSLayer');
    
    // Monte le composant et appelle loadWMSLayer
    mount(AromeComponent);

    // L'attente que l'appel à la couche WMS ait eu lieu
    cy.wait('@fetchWMSLayer');
    
    // Vérifie que la méthode imageOverlay a été appelée
    cy.window().then((window) => {
      const imageOverlay = window.L.imageOverlay;
      expect(imageOverlay).to.have.been.calledWith(
        jasmine.any(String),  // Vérifie que l'URL de l'image est passée correctement
        [[37.5, -12], [55.4, 16]]  // Vérifie les coordonnées du rectangle de l'image
      );
    });
  });

  it('should handle errors when loading WMS layer', () => {
    // Mock de l'appel fetch pour simuler une erreur
    cy.intercept('GET', '**/GetMap?*', {
      statusCode: 500,
      body: { error: 'Server Error' },
    }).as('fetchWMSLayerError');

    // Spy pour vérifier si une erreur est loggée
    cy.spy(console, 'error');

    // Monte le composant
    mount(AromeComponent);

    // Attendre que l'appel échoue
    cy.wait('@fetchWMSLayerError');

    // Vérifie que l'erreur est correctement affichée dans la console
    cy.get('@console.error').should('have.been.calledWith', 'Erreur lors du chargement de la couche WMS :', jasmine.any(String));
  });
});
