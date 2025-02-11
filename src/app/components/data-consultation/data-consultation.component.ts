import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-data-consultation',
  standalone: true,
  templateUrl: './data-consultation.component.html',
  styleUrls: ['./data-consultation.component.css'],
  imports: [NgIf, NgFor, FormsModule, NgxPaginationModule,DecimalPipe], 
})
export class DataConsultationComponent implements OnInit {
  total: number = 0;
  dateDebut: string = '';
  dateFin: string = '';
  Ville: string = '';
  donneesClimatiques: any[] = [];
  localisations: any[] = [];
  filteredCities: any[] = [];
  selectedCity: any = null;
  selectdefault: any = null;
  isfiltered: boolean = false;
  private retryAttempt = 0;
  private maxRetry = 5;
  mesdonnees: any[] = [];
  page: number = 1; 
  itemsPerPage: number = 10; 
  totalItems: number = 0; 
  selectedFormat: string = 'json'; 
  
  availableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'numer_sta', label: 'NUMER_STA' },
    { key: 'date', label: 'Date' },
    { key: 'pmer', label: 'PMER' },
    { key: 'tend', label: 'TEND' },
    { key: 'cod_tend', label: 'COD_TEND' },
    { key: 'dd', label: 'DD' },
    { key: 'ff', label: 'FF' },
    { key: 't', label: 'T' },
    { key: 'td', label: 'TD' },
    { key: 'u', label: 'U' },
    { key: 'vv', label: 'VV' },
    { key: 'ww', label: 'WW' },
    { key: 'n', label: 'N' },
    { key: 'nbas', label: 'NBAS' },
    { key: 'hbas', label: 'HBAS' },
    { key: 'pres', label: 'PRES' },
    { key: 'tend24', label: 'TEND24' },
    { key: 'tn12', label: 'TN12' },
    { key: 'tx12', label: 'TX12' },
    { key: 'tminsol', label: 'TMINSOL' },
    { key: 'raf10', label: 'RAF10' },
    { key: 'rafper', label: 'RAFPER' },
    { key: 'per', label: 'PER' },
    { key: 'rr12', label: 'RR12' }
  ];
  
  selectedColumns: { [key: string]: boolean } = {
    'id':true,
    'numer_sta': true,  
    'date': true         
  };
  
  
  constructor(private dataService: DataService) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    const nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = nextDay;
    this.availableColumns.forEach(col => this.selectedColumns[col.key] = true);
    this.getDataLoc(); 
    this.getData();
    this.loadTotal();
  }

  private loadTotal(): void {
    this.dataService.getTotal().subscribe({
      next: (response) => {
        this.total = response;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du total:', err);
        this.total = 0;
      }
    });
  }
  rechercher() {
    if (!this.Ville || (!this.dateDebut && !this.dateFin)) {
      return;
    }

    this.meteoRequest()
      .subscribe({
        next: (data) => {
          this.donneesClimatiques = data;
          console.log("Données récupérées :", this.donneesClimatiques);
          this.retryAttempt = 0;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des données:', error);
        },
      });
  }

  getData() {
    this.meteoRequestAll()
      .subscribe({
        next: (data) => {
          this.mesdonnees = data;
          console.log(" Données récupérées :", this.mesdonnees);
          this.retryAttempt = 0;
        },
        error: (error) => {
          console.error(' Erreur lors de la récupération des données:', error);
        },
      });
  }
  
  meteoRequestAll(): Observable<any> {
    return this.dataService.getApidata().pipe(
      catchError((error) => {
        console.error(" Erreur lors de la récupération des données :", error);
        return throwError(() => error);
      })
    );
  }
  
  getDataLoc() {
    this.localisationRequest()
      .subscribe({
        next: (data) => {
          this.localisations = data;
          console.log(" Localisations chargées :", this.localisations);
          this.selectDefaultCity();
          this.retryAttempt = 0;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des localisations:', error);
        },
      });
  }

  selectDefaultCity(): void {
    this.selectdefault = this.localisations.find(city => city.ville === 'DIJON-LONGVIC');

    if (this.selectdefault) {
      this.Ville = this.selectdefault.ville;
      this.rechercher(); 
    } else {
      console.log(" Ville par défaut non trouvée !");
    }
  }

  isSelected(column: string): boolean {
    return this.selectedColumns[column];
  }

   meteoRequest(): Observable<any> {
    let apiCall: Observable<any>;
  
    if (this.Ville && this.dateDebut && this.dateFin) {
      apiCall = this.dataService.rechercherEntreDates(this.Ville, this.dateDebut, this.dateFin);
    } else if (this.Ville && this.dateDebut) {
      apiCall = this.dataService.rechercherApresDate(this.Ville, this.dateDebut);
    } else {
      apiCall = this.dataService.rechercherAvantDate(this.Ville, this.dateFin);
    }
  
    return apiCall;
  }
  
  localisationRequest(): Observable<any> {
    return this.dataService.getLocalisations();
  }
  
  onSearch(): void {
    if (!this.Ville.trim()) {
      this.filteredCities = [];
    } else {
      this.filteredCities = this.localisations.filter(city =>
        city.ville.toLowerCase().startsWith(this.Ville.toLowerCase())
      );
      this.isfiltered = true;
    }
  }

  onCitySelect(city: any): void {
    this.selectedCity = city;
    this.Ville = this.selectedCity.ville;
    this.filteredCities = []; 
  }

  onPageChange(event: number): void {
    this.page = event;
  }

  Download(): void {

  if (this.selectedFormat === 'json') {
    this.downloadJSON();
  } else if (this.selectedFormat === 'csv') {
    this.downloadCSV();
  }
}


downloadJSON(): void {
  const dataToDownload = this.donneesClimatiques.map(item => {
    const filteredItem: any = {};
    Object.keys(this.selectedColumns).forEach(key => {
      if (this.selectedColumns[key]) {
        filteredItem[key] = item[key];
      }
    });
    return filteredItem;
  });

  const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });

  const defaultFileName = 'donnees_climatiques.json';
  const fileName = prompt('Veuillez entrer le nom du fichier JSON:', defaultFileName);

  if (!fileName) {
    return;
  }

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

  
  

  downloadCSV(): void {
    
    const selectedKeys = Object.keys(this.selectedColumns).filter(key => this.selectedColumns[key]);
    const headers = selectedKeys.map(key => this.availableColumns.find(col => col.key === key)?.label).join(',');
  
    const rows = this.donneesClimatiques.map(item =>
      selectedKeys.map(key => {
        const value = item[key];
        return value !== null && value !== undefined ? value : '';
      }).join(',')
    );
  
    const csvContent = [headers, ...rows].join('\n');
  
    const defaultFileName = 'donnees_climatiques.csv';
    const fileName = prompt('Veuillez entrer le nom du fichier CSV:', defaultFileName);
    
    if (!fileName) {
      return; 
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
  
  
  
}
