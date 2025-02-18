import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { WmsService } from '../../wms.service'; // Importer le service

@Component({
  selector: 'app-arome',
  templateUrl: './arome.component.html',
  styleUrls: ['./arome.component.css']
})
export class AromeComponent implements OnInit {
  private map!: L.Map;

  constructor(private wmsService: WmsService) {} // Injecter le service

  ngOnInit(): void {
    this.map = L.map('map').setView([46.767834, 4.588333], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Définir les paramètres WMS
    const wmsParams = {
      service: 'WMS',
      version: '1.3.0',
      layers: 'TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
      crs: 'EPSG:4326',
      format: 'image/png',
      bbox: '41.0,-5.0,51.0,9.0',
      height: 2030,
      width: 2030,
      transparent: 'true'
    };

    // Charger la couche WMS via le service
    // Charger la couche WMS via le service
this.wmsService.getWmsLayer(wmsParams).subscribe(response => {
  const url = URL.createObjectURL(response);

  const bounds: L.LatLngBoundsExpression = [[42.9, -5.0], [52.9, 9.0]];

  const overlay = L.imageOverlay(url, bounds).addTo(this.map);

  this.map.fitBounds(bounds);
}, error => {
  console.error("Erreur lors du chargement de la couche WMS :", error);
});

}
}
