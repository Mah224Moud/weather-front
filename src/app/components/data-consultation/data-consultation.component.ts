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

/**
 * Initializes Bootstrap tooltips for all elements with the `data-bs-toggle="tooltip"` attribute after the view has been fully initialized.
 */

  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }

  /**
   * Loads the total number of data records from the data service.
   * Subscribes to the getTotal() observable and sets the total property
   * to the response value on success, or sets it to 0 on error.
   */
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

  /**
   * Subscribes to the getLocalisations() observable and sets the localisations
   * property to the response value on success, or logs an error on error.
   * Resets the retryAttempt property to 0 on success.
   */
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

/**
 * Selects the default city from the list of localisations.
 *
 * Searches for the city with the name "DIJON-LONGVIC" in the `localisations` list and 
 * assigns it to the `selectdefault` property. If found, updates the `Ville` property 
 * with the city's name. Logs a message if the default city is not found.
 */

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

/**
 * Retrieves climate data for the specified city and date range.
 *
 * If the city name (`Ville`), start date (`dateDebut`), or end date (`dateFin`) are not set,
 * the function returns immediately without making any requests.
 *
 * Sends a request through the `consultationService` to fetch climate data between the
 * specified start and end dates for the given city. On success, assigns the retrieved
 * data to the `donneesClimatiques` property and logs the details, including the city name
 * and date range. Resets the `retryAttempt` property to 0 on a successful response.
 *
 * Logs an error message if the data retrieval fails.
 */

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

  /**
   * Checks if a column is selected.
   *
   * @param column The column key to check.
   * @returns Whether the column is selected.
   */
  isSelected(column: string): boolean {
    return this.selectedColumns[column];
  }

  /**
   * Filters the list of cities based on the user's search input.
   *
   * If the search input is empty, clears the filtered cities list.
   * If the search input is not empty, filters the list of cities
   * based on whether the city name starts with the search input
   * (case-insensitive).
   */
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

  /**
   * Handles the selection of a city from the suggestions list.
   *
   * Sets the selected city and clears the filtered cities list.
   * @param city The city to select.
   */
  onCitySelect(city: any): void {
    this.selectedCity = city;
    this.Ville = this.selectedCity.ville;
    this.filteredCities = [];
  }

  /**
   * Handles the page change event from the pagination controls.
   *
   * Sets the current page number.
   * @param event The new page number.
   */
  onPageChange(event: number): void {
    this.page = event;
  }

  /**
   * Initiates the download process for climate data in the selected format.
   * 
   * Depending on the `selectedFormat` property, the function triggers either
   * JSON or CSV download of the filtered climate data. It utilizes helper
   * functions `downloadJSON` and `downloadCSV` to handle the download process
   * for each format respectively.
   */

  Download(): void {
    if (this.selectedFormat === "json") {
      this.downloadJSON();
    } else if (this.selectedFormat === "csv") {
      this.downloadCSV();
    }
  }

  /**
   * Initiates the download process for climate data in JSON format.
   *
   * This function creates a new blob object containing the filtered climate data
   * in JSON format. It then prompts the user to enter a filename and triggers a
   * download of the blob object with the specified filename.
   *
   * Note: The download process is triggered by creating a new link element and
   * setting its href property to the blob object URL. The link element is then
   * clicked programmatically to start the download.
   */
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

  /**
   * Download the filtered climate data in CSV format.
   *
   * This function creates a new CSV string containing the filtered climate data
   * with the selected columns and prompts the user to enter a filename. It then
   * triggers a download of the CSV string with the specified filename.
   *
   * Note: The download process is triggered by creating a new link element and
   * setting its href property to the blob object URL. The link element is then
   * clicked programmatically to start the download.
   */
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
