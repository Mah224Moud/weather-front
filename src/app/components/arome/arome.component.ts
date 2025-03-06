import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { WmsService } from '../../wms.service';
import { Arome } from '../../models/arome';
import { City } from '../../models/city';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-arome',
  templateUrl: './arome.component.html',
  styleUrls: ['./arome.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AromeComponent implements OnInit {
  private map!: L.Map;

  arome: Arome = {longitude_min: -12.0, latitude_min: 37.5, longitude_max: 16.0, latitude_max: 55.4};
  aromeGUYANE: Arome = { longitude_min: 1.05, latitude_min: -56.75, longitude_max: 8.95, latitude_max: -46.30};
  aromeINDIEN: Arome = {longitude_min: -25.9, latitude_min: 32.75, longitude_max: -3.45, latitude_max: 67.6};
  aromeNCALED: Arome = {longitude_min: -26.0, latitude_min: 158.5, longitude_max: -13.75, latitude_max: 171.5};
  aromePOLYN: Arome = {longitude_min: -25.25, latitude_min: -157.5, longitude_max: -12.6, latitude_max: -144.5};
  aromeANTIL: Arome = {longitude_min: 9.7, latitude_min: -75.3, longitude_max: 22.9, latitude_max: -51.7};

  infoCity: City = { id: 0, numeroStation: 0, ville: '', latitude: 0, longitude: 0, altitude: 0 };
  cities: City[] = [];
  searchCity: string = '';
  showSuggestions: boolean = false;
  filteredCities: City[] = [];
  timeIntervals: string[] = [];
  selectedTime: string = '';
  limite : number = 0;

  layers = [
    { cle: "Température (hauteur spécifiée)", valeur: "TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND" },
    { cle: "Direction et vitesse du vent", valeur: "WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND" },
    { cle: "Vitesse du vent", valeur: "WIND_SPEED__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND" },
    { cle: "Rafale de vent", valeur: "WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND" },
    { cle: "Humidité relative", valeur: "RELATIVE_HUMIDITY__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND" },
    { cle: "Précipitations sous forme de neige", valeur: "TOTAL_SNOW_PRECIPITATION__GROUND_OR_WATER_SURFACE" },
    { cle: "Précipitations totales", valeur: "TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE" },
    { cle: "Pression au sol", valeur: "PRESSURE__GROUND_OR_WATER_SURFACE" },
    { cle: "Nébulosité basse", valeur: "LOW_CLOUD_COVER__GROUND_OR_WATER_SURFACE" },
    { cle: "Nébulosité haute", valeur: "HIGH_CLOUD_COVER__GROUND_OR_WATER_SURFACE" },
    { cle: "Nébulosité moyenne", valeur: "MEDIUM_CLOUD_COVER__GROUND_OR_WATER_SURFACE" },
    { cle: "CAPE (énergie potentielle convective disponible)", valeur: "CONVECTIVE_AVAILABLE_POTENTIAL_ENERGY__GROUND_OR_WATER_SURFACE" },
    { cle: "Température de brillance", valeur: "BRIGHTNESS_TEMPERATURE__GROUND_OR_WATER_SURFACE" },
    { cle: "Précipitations sous forme liquide", valeur: "TOTAL_WATER_PRECIPITATION__GROUND_OR_WATER_SURFACE" },
    { cle: "Taux de précipitations", valeur: "TOTAL_PRECIPITATION_RATE__GROUND_OR_WATER_SURFACE" },
    { cle: "Altitude géométrique", valeur: "GEOMETRIC_HEIGHT__GROUND_OR_WATER_SURFACE" }
  ];
  selectedLayer: string = this.layers[0].valeur;
  overlays: L.ImageOverlay[] = []; 
  isLoading: boolean = false; 

  constructor(private wmsService: WmsService, private dataService: DataService) {}

  ngOnInit(): void {
    this.getLocations();
    this.generateThreeHourIntervals();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [46.603354, 1.888334],
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private getLocations(): void {
    this.dataService.getLocalisations().subscribe({
      next: (response: City[]) => {
        this.cities = response;
        console.log('Villes chargées:', this.cities);
        this.cities.push({
          id: -1,
          numeroStation: 0,
          ville: "FRANCE",
          latitude: 46.603354,
          longitude: 1.888334,
          altitude: 0
        });

        const c = this.cities.find(c => c.ville.includes('FRANCE')) || this.cities[0];
        if (c) {
          this.searchCity = c.ville;
          this.infoCity = c;
          this.generate_map(0, this.infoCity, this.selectedLayer);
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  generateThreeHourIntervals(): void {
    const today = new Date();  
    const baseDate = new Date(today);
    baseDate.setHours(1, 0, 0, 0); 


    const date1: Date = new Date(baseDate);
    const date2: Date = new Date(baseDate);
    const date3: Date = new Date(baseDate);
    const date4: Date = new Date(baseDate);
    const date5: Date = new Date(baseDate);
    const date6: Date = new Date(baseDate);
    const date7: Date = new Date(baseDate);
    const date8: Date = new Date(baseDate);

    // Ajoute les intervalles de 3 heures à chaque date
    date1.setHours(baseDate.getHours() + 0);  // 0 heure du jour
    date2.setHours(baseDate.getHours() + 3);  // +3 heures
    date3.setHours(baseDate.getHours() + 6);  // +6 heures
    date4.setHours(baseDate.getHours() + 9);  // +9 heures
    date5.setHours(baseDate.getHours() + 12); // +12 heures
    date6.setHours(baseDate.getHours() + 15); // +15 heures
    date7.setHours(baseDate.getHours() + 18); // +18 heures
    date8.setHours(baseDate.getHours() + 21); // +21 heures

    // Fonction pour formater la date au format souhaité : YYYY-MM-DDTHH:mm:ssZ
    function formatDateToCustomISOString(date: Date): string {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');  // Les mois commencent à 0, donc on ajoute 1
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');  // Les secondes sur 2 chiffres

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    }

    this.timeIntervals.push(formatDateToCustomISOString(date1)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date2)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date3)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date4)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date5)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date6)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date7)); // Ajoute la date au tableau
    this.timeIntervals.push(formatDateToCustomISOString(date8)); // Ajoute la date au tableau

    // Sélectionne le premier intervalle de temps par défaut
    this.selectedTime = this.timeIntervals[0];
  }

  VilleLoc(city: string): string {
    const villes: { [key: string]: string } = {
      "ABBEVILLE": "FRANCE",
      "LILLE-LESQUIN": "FRANCE",
      "PTE DE LA HAGUE": "FRANCE",
      "CAEN-CARPIQUET": "FRANCE",
      "ROUEN-BOOS": "FRANCE",
      "REIMS-PRUNAY": "FRANCE",
      "BREST-GUIPAVAS": "FRANCE",
      "PLOUMANAC'H": "FRANCE",
      "RENNES-ST JACQUES": "FRANCE",
      "ALENCON": "FRANCE",
      "ORLY": "FRANCE",
      "TROYES-BARBEREY": "FRANCE",
      "NANCY-OCHEY": "FRANCE",
      "STRASBOURG-ENTZHEIM": "FRANCE",
      "BELLE ILE-LE TALUT": "FRANCE",
      "NANTES-BOUGUENAIS": "FRANCE",
      "TOURS": "FRANCE",
      "BOURGES": "FRANCE",
      "DIJON-LONGVIC": "FRANCE",
      "BALE-MULHOUSE": "FRANCE",
      "PTE DE CHASSIRON": "FRANCE",
      "POITIERS-BIARD": "FRANCE",
      "LIMOGES-BELLEGARDE": "FRANCE",
      "CLERMONT-FD": "FRANCE",
      "LE PUY-LOUDES": "FRANCE",
      "LYON-ST EXUPERY": "FRANCE",
      "BORDEAUX-MERIGNAC": "FRANCE",
      "GOURDON": "FRANCE",
      "MILLAU": "FRANCE",
      "MONTELIMAR": "FRANCE",
      "EMBRUN": "FRANCE",
      "MONT-DE-MARSAN": "FRANCE",
      "TARBES-OSSUN": "FRANCE",
      "ST GIRONS": "FRANCE",
      "TOULOUSE-BLAGNAC": "FRANCE",
      "MONTPELLIER": "FRANCE",
      "MARIGNANE": "FRANCE",
      "CAP CEPET": "FRANCE",
      "NICE": "FRANCE",
      "PERPIGNAN": "FRANCE",
      "AJACCIO": "FRANCE",
      "BASTIA": "FRANCE",
      "GLORIEUSES": "INDIEN",
      "JUAN DE NOVA": "INDIEN",
      "EUROPA": "INDIEN",
      "TROMELIN": "INDIEN",
      "GILLOT-AEROPORT": "INDIEN",
      "PAMANDZI": "MAYOTTE",
      "LA DESIRADE METEO": "GUADELOUPE",
      "ST-BARTHELEMY METEO": "GUADELOUPE",
      "LE RAIZET AERO": "GUADELOUPE",
      "TRINITE-CARAVEL": "MARTINIQUE",
      "LAMENTIN-AERO": "MARTINIQUE",
      "SAINT LAURENT": "GUYANE",
      "CAYENNE-MATOURY": "GUYANE",
      "SAINT GEORGES": "GUYANE",
      "MARIPASOULA": "GUYANE",
      "DUMONT D'URVILLE": "AUCUN",
      "KERGUELEN": "AUCUN",
      "CROZET": "AUCUN",
      "NOUVELLE AMSTERDAM": "AUCUN",
      "ST-PIERRE": "AUCUN"
    };
  
    // Retourne la localisation en fonction de la ville
    return villes[city] || "AUCUN"; // "AUCUN" par défaut si la ville n'est pas trouvée
  }
  
  onSearchInput() {
    if (this.searchCity.trim()) {
      this.showSuggestions = true;
      this.filteredCities = this.cities.filter(city =>
        city.ville.toLowerCase().includes(this.searchCity.toLowerCase())
      );
    } else {
      this.showSuggestions = false;
      this.filteredCities = [];
    }
  }

  selectCity(city: City) {
    this.searchCity = city.ville;
    this.showSuggestions = false;
    this.infoCity = city;
    this.generate_map(1, city, this.selectedLayer);
    //console.log(city.numeroStation)
  }

  updatePins() {
    let bounds = L.latLngBounds([]);

    this.cities.forEach(city => {
      if (city.ville !== "FRANCE") {
        let marker = L.marker([city.latitude, city.longitude])
          .addTo(this.map)
          .bindPopup(`<b>${city.ville}</b>`);

        bounds.extend(marker.getLatLng());
      }
    });
  }

  generate_map(bounds: number, city: { ville: string, latitude: number, longitude: number }, layer: string) {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([46.767834, 4.588333], 6);

    if (city.ville === "FRANCE"){
      this.arome = {
        longitude_min: -12.0,
        latitude_min: 37.5,
        longitude_max: 16.0,
        latitude_max: 55.4 
      };
      if (this.map) {
        this.map.remove();
      }
      this.map = L.map('map').setView([46.767834, 4.588333], 6);
    }else if (this.VilleLoc(city.ville) === "FRANCE") {
      this.arome = {
        longitude_min: city.longitude - bounds,  // Remplace -12.0 par city.longitude
        latitude_min: city.latitude - bounds/2,   // Remplace 37.5 par city.latitude
        longitude_max: city.longitude + bounds, // Remplace 16.0 par city.longitude
        latitude_max: city.latitude + bounds/2    // Remplace 55.4 par city.latitude
      };
      
      const b: L.LatLngBoundsExpression = [[this.arome.latitude_min, this.arome.longitude_min], [this.arome.latitude_max, this.arome.longitude_max]];
      this.map.fitBounds(b);
    }else if (this.VilleLoc(city.ville) === "GUYANE" || this.VilleLoc(city.ville) === "INDIEN" || this.VilleLoc(city.ville) === "NOUVELLE CALEDONIE" || this.VilleLoc(city.ville) === "POLYNESIE" || this.VilleLoc(city.ville) === "ANTILLE") {
      this.arome = {
        longitude_min: -12.0,
        latitude_min: 37.5,
        longitude_max: 16.0,
        latitude_max: 55.4 
      };
      const b: L.LatLngBoundsExpression = [[city.latitude, city.longitude], [city.latitude, city.longitude]];
      this.map.fitBounds(b);
    } else if (this.VilleLoc(city.ville) === "AUCUN") {
      this.arome = {
        longitude_min: -12.0,
        latitude_min: 37.5,
        longitude_max: 16.0,
        latitude_max: 55.4 
      };
    }
     else {
      console.log("City not recognized");
    }
      
    //const bbox = `${this.arome.longitude_min},${this.arome.latitude_min},${this.arome.longitude_max},${this.arome.latitude_max}`;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>'
    }).addTo(this.map);

    this.updateMapWithSelectedTime();  // Met à jour la carte avec l'intervalle de temps sélectionné
  }

  // Fonction pour mettre à jour la carte avec l'intervalle de temps sélectionné
  updateMapWithSelectedTime(): void {
    if (!this.selectedTime) {
      console.error("Aucun intervalle de temps sélectionné.");
      return;
    }

    this.isLoading = true;  // Active l'indicateur de chargement

    const wmsParams = {
      service: 'WMS',
      version: '1.3.0',
      layers: this.selectedLayer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.arome.latitude_min},${this.arome.longitude_min},${this.arome.latitude_max},${this.arome.longitude_max}`,
      height: 2048,
      width: 3072,
      transparent: 'true',
      time: this.selectedTime
    };

    this.wmsService.getWmsLayer(wmsParams).subscribe(response => {
      const url = URL.createObjectURL(response);
      const bounds: L.LatLngBoundsExpression = [
        [this.arome.latitude_min, this.arome.longitude_min],
        [this.arome.latitude_max, this.arome.longitude_max]
      ];

      // Supprime les overlays existants
      this.overlays.forEach(overlay => this.map.removeLayer(overlay));
      this.overlays = [];

      const overlay = L.imageOverlay(url, bounds, { opacity: 0.9 }).addTo(this.map);
      this.overlays.push(overlay);  // Ajouter chaque overlay dans le tableau

      
    const wmsParams1 = {
      service: 'WMS',
      version: '1.3.0',
      layers: this.selectedLayer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.aromeNCALED.longitude_min},${this.aromeNCALED.latitude_min},${this.aromeNCALED.longitude_max},${this.aromeNCALED.latitude_max}`,
      height: 2048,
      width: 3072,
      transparent: 'true',
      time: this.selectedTime
    };

    setTimeout(() => {
      this.wmsService.getWmsLayerNCALED(wmsParams1).subscribe(response => {
        const url = URL.createObjectURL(response);
        const bounds: L.LatLngBoundsExpression = [[-26.0, 158.5], [-13.75, 171.5]];
        const overlay = L.imageOverlay(url, bounds, { opacity: 1 }).addTo(this.map);
        this.overlays.push(overlay);
      }, error => {
        console.error("Erreur lors du chargement de la deuxième couche WMS :", error);
        this.isLoading = false;  // Désactive l'indicateur de chargement en cas d'erreur
      });
    }, 50);

    const wmsParams2 = {
      service: 'WMS',
      version: '1.3.0',
      layers: this.selectedLayer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.aromeINDIEN.longitude_min},${this.aromeINDIEN.latitude_min},${this.aromeINDIEN.longitude_max},${this.aromeINDIEN.latitude_max}`,
      height: 2048,
      width: 3072,
      transparent: 'true',
      time: this.selectedTime
    };

    setTimeout(() => {
      this.wmsService.getWmsLayerINDIEN(wmsParams2).subscribe(response => {
        const url = URL.createObjectURL(response);
        const bounds: L.LatLngBoundsExpression = [[-25.9, 32.75], [-3.45, 67.6]];
        const overlay = L.imageOverlay(url, bounds, { opacity: 1 }).addTo(this.map);
        this.overlays.push(overlay);
      }, error => {
        console.error("Erreur lors du chargement de la troisième couche WMS :", error);
        this.isLoading = false;  // Désactive l'indicateur de chargement en cas d'erreur
      });
    }, 100);

    const wmsParams3 = {
      service: 'WMS',
      version: '1.3.0',
      layers: this.selectedLayer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.aromeGUYANE.longitude_min},${this.aromeGUYANE.latitude_min},${this.aromeGUYANE.longitude_max},${this.aromeGUYANE.latitude_max}`,
      height: 2048,
      width: 3072,
      transparent: 'true',
      time: this.selectedTime
    };

    setTimeout(() => {
      this.wmsService.getWmsLayerGUYANE(wmsParams3).subscribe(response => {
        const url = URL.createObjectURL(response);
        const bounds: L.LatLngBoundsExpression = [[1.05, -56.75], [8.95, -46.30]];
        const overlay = L.imageOverlay(url, bounds, { opacity: 1 }).addTo(this.map);
        this.overlays.push(overlay);
      }, error => {
        console.error("Erreur lors du chargement de la quatrième couche WMS :", error);
        this.isLoading = false;  // Désactive l'indicateur de chargement en cas d'erreur
      });
    }, 150);

    const wmsParams4 = {
      service: 'WMS',
      version: '1.3.0',
      layers: this.selectedLayer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.aromeANTIL.longitude_min},${this.aromeANTIL.latitude_min},${this.aromeANTIL.longitude_max},${this.aromeANTIL.latitude_max}`,
      height: 2048,
      width: 3072,
      transparent: 'true',
      time: this.selectedTime
    };

    setTimeout(() => {
      this.wmsService.getWmsLayerANTIL(wmsParams4).subscribe(response => {
        const url = URL.createObjectURL(response);
        const bounds: L.LatLngBoundsExpression = [[9.7, -75.3], [22.9, -51.7]];
        const overlay = L.imageOverlay(url, bounds, { opacity: 1 }).addTo(this.map);
        this.overlays.push(overlay);
      }, error => {
        console.error("Erreur lors du chargement de la cinquième couche WMS :", error);
        this.isLoading = false;  // Désactive l'indicateur de chargement en cas d'erreur
      });
    }, 200);

    const wmsParams5 = {
      service: 'WMS',
      version: '1.3.0',
      layers: this.selectedLayer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.aromePOLYN.longitude_min},${this.aromePOLYN.latitude_min},${this.aromePOLYN.longitude_max},${this.aromePOLYN.latitude_max}`,
      height: 2048,
      width: 3072,
      transparent: 'true',
      time: this.selectedTime
    };

    setTimeout(() => {
      this.wmsService.getWmsLayerPOLYN(wmsParams5).subscribe(response => {
        const url = URL.createObjectURL(response);
        const bounds: L.LatLngBoundsExpression = [[-25.25, -157.5], [-12.6, -144.5]];
        const overlay = L.imageOverlay(url, bounds, { opacity: 1 }).addTo(this.map);
        this.overlays.push(overlay);
        this.isLoading = false;  // Désactive l'indicateur de chargement après le chargement de la dernière image
      }, error => {
        console.error("Erreur lors du chargement de la sixième couche WMS :", error);
        this.isLoading = false;  // Désactive l'indicateur de chargement en cas d'erreur
      });
    }, 250);
  })
  this.updatePins();
  }

  clearSearch() {
    this.searchCity = '';
    this.filteredCities = [];
    this.showSuggestions = false;
  }
}
