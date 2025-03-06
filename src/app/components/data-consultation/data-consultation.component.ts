import { Component, OnInit, AfterViewInit } from "@angular/core";
import { NgIf, NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../data.service";
import { NgxPaginationModule } from "ngx-pagination";
import { DecimalPipe } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { ConsultationService } from "../../services/consultation.service";
import { UserInfo } from "../../models/userInfo";
import { COLONNE_DISPO } from "../../models/consultation";

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
  Ville: string = "DIJON-LONGVIC";
  donneesClimatiques: any[] = [];
  localisations: any[] = [];
  filteredCities: any[] = [];
  selectedCity: any = null;
  selectdefault: any = "DIJON-LONGVIC";
  isfiltered: boolean = false;
  private retryAttempt = 0;
  private maxRetry = 5;
  mesdonnees: any[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  selectedFormat: string = "json";

  isLoggedIn = false;

  availableColumns = COLONNE_DISPO;

  selectedColumns: { [key: string]: boolean } = {
    id: true,
    numer_sta: true,
    date: true,
  };

  constructor(
    private dataService: DataService, 
    private consultationService: ConsultationService,
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

    this.loadTotal();            
    this.getDataLoc();       
    this.selectDefaultCity();  


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

  getDataLoc() {
    this.dataService.getLocalisations().subscribe({
      next: (data) => {
        this.localisations = data;
        console.log(" Localisations chargées :", this.localisations);
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

    if (this.selectdefault !== undefined && this.selectdefault !== null) {
      this.Ville = this.selectdefault.ville;
    }else {
      console.log(" Ville par défaut non trouvée !");
    }
  }

  rechercher() {
    if(!this.Ville || !this.dateDebut || !this.dateFin) {
      return;
    }

    this.consultationService.rechercherEntreDates(this.Ville, this.dateDebut, this.dateFin).subscribe({
      next: (data) => {
        this.donneesClimatiques = data;
        console.log("Données récupérées :", this.donneesClimatiques);
        console.log("Ville :", this.Ville);
        console.log("dateDebut :", this.dateDebut);
        console.log("dateFin  :", this.dateFin);
        this.retryAttempt = 0;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des données:", error);
      },
    });
  }

  isSelected(column: string): boolean {
    return this.selectedColumns[column];
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
