import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { WmsService } from '../../services/wms.service';
import { Arome } from '../../models/arome';
import { City } from '../../models/city';
import { DataService } from '../../data.service';
import { LAYERS } from '../../models/layers';
import { VILLES } from '../../models/villes_api';

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

  layers = LAYERS;
  selectedLayer: string = this.layers[0].valeur;
  overlays: L.ImageOverlay[] = []; 
  isLoading: boolean = false; 

  constructor(private wmsService: WmsService, private dataService: DataService) {}

  ngOnInit(): void {
    this.getLocations();
    this.generateThreeHourIntervals();
  }

/**
 * Initializes the Leaflet map centered on France with a default zoom level.
 * Adds OpenStreetMap tile layer to the map with proper attribution.
 */

  private initMap(): void {
    this.map = L.map('map', {
      center: [46.603354, 1.888334],
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

/**
 * Retrieves a list of cities and adds a default "FRANCE" city.
 *
 * Subscribes to the `getLocalisations` service to get the list of cities and
 * logs the loaded cities to the console. A default city "FRANCE" is added to
 * the list. The method then selects the city named "FRANCE" or defaults to
 * the first city in the list. Updates the `searchCity` and `infoCity` properties
 * with the selected city and generates a map overlay for the selected layer.
 *
 * If an error occurs during the subscription, it logs the error to the console.
 */

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

  /**
   * Generates an array of 8 ISO 8601 formatted date strings, each 3 hours apart from the current time.
   * The array is stored in the component's timeIntervals property.
   * The selectedTime property is set to the first element of the array.
   * The function is called when the component is initialized.
   */
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

    
    date1.setHours(baseDate.getHours() + 0);  
    date2.setHours(baseDate.getHours() + 3);  
    date3.setHours(baseDate.getHours() + 6);  
    date4.setHours(baseDate.getHours() + 9);  
    date5.setHours(baseDate.getHours() + 12); 
    date6.setHours(baseDate.getHours() + 15); 
    date7.setHours(baseDate.getHours() + 18); 
    date8.setHours(baseDate.getHours() + 21); 

 
  /**
   * Converts a Date object to a custom ISO 8601 string representation.
   * The output format is: "YYYY-MM-DDTHH:MM:SSZ".
   * The time is in UTC.
   * @param date The Date object to format.
   * @returns A string in the custom ISO 8601 format.
   */
    function formatDateToCustomISOString(date: Date): string {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');  
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    }

    this.timeIntervals.push(formatDateToCustomISOString(date1)); 
    this.timeIntervals.push(formatDateToCustomISOString(date2)); 
    this.timeIntervals.push(formatDateToCustomISOString(date3)); 
    this.timeIntervals.push(formatDateToCustomISOString(date4)); 
    this.timeIntervals.push(formatDateToCustomISOString(date5)); 
    this.timeIntervals.push(formatDateToCustomISOString(date6)); 
    this.timeIntervals.push(formatDateToCustomISOString(date7)); 
    this.timeIntervals.push(formatDateToCustomISOString(date8)); 

 
    this.selectedTime = this.timeIntervals[0];
  }

  /**
   * Returns the location of the given city, or "AUCUN" if it is not found.
   * @param city The city to look up.
   * @returns The location of the city.
   */
  VilleLoc(city: string): string {
    const villes = VILLES;  
    return villes[city] || "AUCUN"; 
  }
  
  /**
   * Called when the user inputs a search query in the search bar.
   * Filters the list of cities based on the search query,
   * and shows or hides the suggestions list accordingly.
   */
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

/**
 * Sets the selected city and hides the suggestions list. Updates the map
 * with the selected city and layer.
 * @param {City} city - The city to select.
 */

  selectCity(city: City) {
    this.searchCity = city.ville;
    this.showSuggestions = false;
    this.infoCity = city;
    this.generate_map(1, city, this.selectedLayer);
    //console.log(city.numeroStation)
  }

  /**
   * Adds a marker for each city on the map, except for the "FRANCE" city.
   * It also updates the map bounds to include all the added markers.
   */
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

  /**
   * Generate the map with the given bounds and layer.
   * @param bounds the bounds of the map (in degrees)
   * @param city the city to center the map on
   * @param layer the layer to use (e.g. "temperature")
   */
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
        longitude_min: city.longitude - bounds,  
        latitude_min: city.latitude - bounds/2, 
        longitude_max: city.longitude + bounds,
        latitude_max: city.latitude + bounds/2  
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
      
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>'
    }).addTo(this.map);

    this.updateMapWithSelectedTime();  
  }

 
  /**
   * Mets à jour la carte avec l'intervalle de temps sélectionné.
   * Appelle le service WMS pour récupérer les couches WMS correspondantes à l'intervalle de temps
   * et les ajoute à la carte.
   * Désactive l'indicateur de chargement une fois que les couches sont chargées.
   */
  updateMapWithSelectedTime(): void {
    if (!this.selectedTime) {
      console.error("Aucun intervalle de temps sélectionné.");
      return;
    }

    this.isLoading = true;  

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

      this.overlays.forEach(overlay => this.map.removeLayer(overlay));
      this.overlays = [];

      const overlay = L.imageOverlay(url, bounds, { opacity: 0.9 }).addTo(this.map);
      this.overlays.push(overlay);  
      
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
        this.isLoading = false;  
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
        this.isLoading = false;  
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
        this.isLoading = false; 
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
        this.isLoading = false;  
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
        this.isLoading = false;  
      }, error => {
        console.error("Erreur lors du chargement de la sixième couche WMS :", error);
        this.isLoading = false;  
      });
    }, 250);
  })
  this.updatePins();
  }

  /**
   * Resets the search input and suggestions.
   * Called when the user clicks on the clear button.
   */
  clearSearch() {
    this.searchCity = '';
    this.filteredCities = [];
    this.showSuggestions = false;
  }
}
