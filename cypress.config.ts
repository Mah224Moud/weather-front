import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Configuration pour les tests fonctionnels (end-to-end)
    setupNodeEvents(on, config) {
      // implémenter les écouteurs d'événements ici si nécessaire
    },
    baseUrl: "http://localhost:4200", // ou l'URL de ton application
    specPattern: "cypress/integration/interfacemeteo.spec.js", // répertoire des tests fonctionnels
  },

  /*
    component: {
      // Configuration pour les tests unitaires (tests de composants)
      devServer: {
        framework: "angular", // Si tu utilises Angular
        bundler: "webpack",   // Utilisation de Webpack
      },
      // specPattern: "src/**/ //*.spec.ts", // répertoire des tests unitaires
  //},
  // Ajout d'une option globale si nécessaire
  // Option pour désactiver l'enregistrement vidéo si tu préfères ne pas l'avoir
  video: false,

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },
});
