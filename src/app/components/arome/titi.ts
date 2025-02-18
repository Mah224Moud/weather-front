import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-arome',
  templateUrl: './arome.component.html',
  styleUrls: ['./arome.component.css']
})
export class AromeComponent implements OnInit {
  private map!: L.Map;
  private apiKey: string = ""; // Remplace par ta vraie clé API

  ngOnInit(): void {
    this.initMap();
    this.loadWMSLayer();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [46.5, 2.5], // Centre de la France
      zoom: 6
    });

    // Ajout d'une couche de base (Fond de carte OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private async loadWMSLayer() {
    const wmsUrl = 'https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-001-FRANCE-WMS/GetMap?' +
                   'service=WMS&version=1.3.0&layers=WIND_SPEED__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND' +
                   '&crs=EPSG:4326&format=image/png&bbox=37.5,-12,55.4,16&height=256&width=256&transparent=true';

    try {
      const response = await fetch(wmsUrl, {
        headers: {
          'accept': 'image/png',
          'apikey': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Ajouter l'image sous forme de couche sur la carte
      L.imageOverlay(imageUrl, [[37.5, -12], [55.4, 16]]).addTo(this.map);
    } catch (error) {
      console.error("Erreur lors du chargement de la couche WMS :", error);
    }
  }
}
