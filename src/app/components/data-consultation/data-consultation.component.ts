import { Component, OnInit, AfterViewInit } from "@angular/core";
import { NgIf, NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../data.service";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { NgxPaginationModule } from "ngx-pagination";
import { DecimalPipe } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { UserInfo } from "../../models/userInfo";

declare var bootstrap: any;

@Component({
  selector: "app-data-consultation",
  standalone: true,
  templateUrl: "./data-consultation.component.html",
  styleUrls: ["./data-consultation.component.css"],
  imports: [NgIf, NgFor, FormsModule, NgxPaginationModule, DecimalPipe],
})
export class DataConsultationComponent implements OnInit, AfterViewInit {
  total: number = 0;
  dateDebut: string = "";
  dateFin: string = "";
  Ville: string = "";
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
  selectedFormat: string = "json";

  isLoggedIn = false;

  availableColumns = [
    { key: "id", label: "ID", description: "Identifiant unique" },
    {
      key: "numer_sta",
      label: "NUMER_STA",
      description: "Numéro de la station",
    },
    { key: "date", label: "Date", description: "Date de la mesure" },
    { key: "pmer", label: "PMER", description: "Pression au niveau de la mer" },
    { key: "tend", label: "TEND", description: "Tendance barométrique" },
    { key: "cod_tend", label: "COD_TEND", description: "Code de tendance" },
    { key: "dd", label: "DD", description: "Direction du vent" },
    { key: "ff", label: "FF", description: "Vitesse du vent" },
    { key: "t", label: "T", description: "Température" },
    { key: "td", label: "TD", description: "Température du point de rosée" },
    { key: "u", label: "U", description: "Humidité relative" },
    { key: "vv", label: "VV", description: "Visibilité horizontale" },
    { key: "ww", label: "WW", description: "Temps significatif" },
    { key: "n", label: "N", description: "Nébulosité totale" },
    { key: "nbas", label: "NBAS", description: "Nébulosité des nuages bas" },
    {
      key: "hbas",
      label: "HBAS",
      description: "Hauteur de la base des nuages",
    },
    { key: "pres", label: "PRES", description: "Pression atmosphérique" },
    {
      key: "tend24",
      label: "TEND24",
      description: "Évolution de pression en 24h",
    },
    { key: "tn12", label: "TN12", description: "Température minimale sur 12h" },
    { key: "tx12", label: "TX12", description: "Température maximale sur 12h" },
    {
      key: "tminsol",
      label: "TMINSOL",
      description: "Température minimale du sol",
    },
    {
      key: "raf10",
      label: "RAF10",
      description: "Rafale maximale en 10 minutes",
    },
    { key: "rafper", label: "RAFPER", description: "Période de rafale" },
    { key: "per", label: "PER", description: "Période observée" },
    { key: "rr12", label: "RR12", description: "Précipitations sur 12h" },
  ];

  selectedColumns: { [key: string]: boolean } = {
    id: true,
    numer_sta: true,
    date: true,
  };

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().split("T")[0];
    const nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    this.dateDebut = today;
    this.dateFin = nextDay;
    this.availableColumns.forEach(
      (col) => (this.selectedColumns[col.key] = true)
    );
    this.getDataLoc();
    this.getData();
    this.loadTotal();

    this.authService.user$.subscribe((user: UserInfo | null) => {
      this.isLoggedIn = !!user;
      console.log("Status de connexion mis à jour :", this.isLoggedIn);
    });
  }

  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }
  private loadTotal(): void {
    this.dataService.getTotal().subscribe({
      next: (response) => {
        this.total = response;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération du total:", err);
        this.total = 0;
      },
    });
  }
  rechercher() {
    if (!this.Ville || (!this.dateDebut && !this.dateFin)) {
      return;
    }

    this.meteoRequest().subscribe({
      next: (data) => {
        this.donneesClimatiques = data;
        console.log("Données récupérées :", this.donneesClimatiques);
        this.retryAttempt = 0;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des données:", error);
      },
    });
  }

  getData() {
    this.meteoRequestAll().subscribe({
      next: (data) => {
        this.mesdonnees = data;
        console.log(" Données récupérées :", this.mesdonnees);
        this.retryAttempt = 0;
      },
      error: (error) => {
        console.error(" Erreur lors de la récupération des données:", error);
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
    this.localisationRequest().subscribe({
      next: (data) => {
        this.localisations = data;
        console.log(" Localisations chargées :", this.localisations);
        this.selectDefaultCity();
        this.retryAttempt = 0;
      },
      error: (error) => {
        console.error(
          "Erreur lors de la récupération des localisations:",
          error
        );
      },
    });
  }

  selectDefaultCity(): void {
    this.selectdefault = this.localisations.find(
      (city) => city.ville === "DIJON-LONGVIC"
    );

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
      apiCall = this.dataService.rechercherEntreDates(
        this.Ville,
        this.dateDebut,
        this.dateFin
      );
    } else if (this.Ville && this.dateDebut) {
      apiCall = this.dataService.rechercherApresDate(
        this.Ville,
        this.dateDebut
      );
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
      this.filteredCities = this.localisations.filter((city) =>
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
    if (this.selectedFormat === "json") {
      this.downloadJSON();
    } else if (this.selectedFormat === "csv") {
      this.downloadCSV();
    }
  }

  downloadJSON(): void {
    const dataToDownload = this.donneesClimatiques.map((item) => {
      const filteredItem: any = {};
      Object.keys(this.selectedColumns).forEach((key) => {
        if (this.selectedColumns[key]) {
          filteredItem[key] = item[key];
        }
      });
      return filteredItem;
    });

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
      type: "application/json",
    });

    const defaultFileName = "donnees_climatiques.json";
    const fileName = prompt(
      "Veuillez entrer le nom du fichier JSON:",
      defaultFileName
    );

    if (!fileName) {
      return;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  downloadCSV(): void {
    const selectedKeys = Object.keys(this.selectedColumns).filter(
      (key) => this.selectedColumns[key]
    );
    const headers = selectedKeys
      .map((key) => this.availableColumns.find((col) => col.key === key)?.label)
      .join(",");

    const rows = this.donneesClimatiques.map((item) =>
      selectedKeys
        .map((key) => {
          const value = item[key];
          return value !== null && value !== undefined ? value : "";
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const defaultFileName = "donnees_climatiques.csv";
    const fileName = prompt(
      "Veuillez entrer le nom du fichier CSV:",
      defaultFileName
    );

    if (!fileName) {
      return;
    }
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
}
