import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { WmsService } from '../../wms.service'; // Importer le service
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
  arome: Arome = {longitude_min: 0,latitude_min: 0,longitude_max: 0,latitude_max: 0}
  infoCity: City = { id: 0, numeroStation: 0, ville: '', latitude: 0, longitude: 0, altitude: 0 };
  cities: City[] = [];
  searchCity: string = '';
  showSuggestions: boolean = false;
  filteredCities: City[] = [];
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
  

  constructor(private wmsService: WmsService, private dataService: DataService ) {} 

  ngOnInit(): void {
    this.getLocations();
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
        if ( c ) {
          this.searchCity =  c .ville;
          this.infoCity = c;
          this.generate_map(0.5, this.infoCity, this.selectedLayer);
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
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
    this.generate_map(0.5, city, this.selectedLayer);

    console.log(city.numeroStation)
  }

  generate_map(bounds: number, city: City, layer: string){
    if (this.map) {
      this.map.remove();
  }
    this.map = L.map('map').setView([46.767834, 4.588333], 6);

    if (city.ville === "FRANCE") {
      this.arome = {
        longitude_min: -5.0,
        latitude_min: 40.0, 
        longitude_max: 9.0,  
        latitude_max: 51.0  
      };
    }
    else{
      this.arome.longitude_max = city.longitude + bounds;
      this.arome.latitude_max = city.latitude + bounds;
      this.arome.longitude_min = city.longitude - bounds;
      this.arome.latitude_min = city.latitude - bounds;
    }

    console.log(this.arome);
    const bbox = `${this.arome.longitude_min},${this.arome.latitude_min},${this.arome.longitude_max},${this.arome.latitude_max}`;
    console.log("BBOX:", bbox);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    const wmsParams = {
      service: 'WMS',
      version: '1.3.0',
      layers: layer,
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: `${this.arome.latitude_min},${this.arome.longitude_min},${this.arome.latitude_max},${this.arome.longitude_max}`,
      height: 2030,
      width: 2030,
      transparent: 'true'
    };
      this.wmsService.getWmsLayer(wmsParams).subscribe(response => {
        const url = URL.createObjectURL(response);
        const bounds: L.LatLngBoundsExpression = [[this.arome.latitude_min, this.arome.longitude_min], [this.arome.latitude_max, this.arome.longitude_max]];

        const overlay = L.imageOverlay(url, bounds).addTo(this.map);

        this.map.fitBounds(bounds);
      }, error => {
        console.error("Erreur lors du chargement de la couche WMS :", error);
      });
  }

  clearSearch() {
    this.searchCity = '';
    this.filteredCities = [];
    this.showSuggestions = false;
  }
    
  
}
