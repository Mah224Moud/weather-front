import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { Observable, throwError, forkJoin, map } from "rxjs";
import { tap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataService {
  private apiUrl_localisation = "http://172.31.60.248:8080/api/localisations";
  private apiClimatTotal =
    "http://172.31.60.248:8080/api/donnees-climatiques/count";
  private apiInfoCity =
    "http://172.31.60.248:8080/api/donnees-climatiques/info/";
  private apiYearlyStat =
    "http://172.31.60.248:8080/api/donnees-climatiques/moyenneAll/";
  private apiUrl = "http://172.31.60.248:11434/api/generate";
  private apiUrl_donneclimatique =
    "http://172.31.60.248:8080/api/donnees-climatiques";
  private apiWeeklyStat =
    "http://172.31.60.248:8080/api/donnees-climatiques/moyennes/";
  private apiDailyStat =
    "http://172.31.60.248:8080/api/donnees-climatiques/moyenneDaily";
    private apiDailyStatVUE =
    "http://172.31.60.248:8080/api/donnees-climatiques/moyenneDailyVue";
  private apiAverage =
    "http://172.31.60.248:8080/api/donnees-climatiques/moyenne-delta";
  private apiTopCanicule =
    "http://172.31.60.248:8080/api/donnees-climatiques/top15Canicule";
  private apiTopFroid =
    "http://172.31.60.248:8080/api/donnees-climatiques/top15Froid";
    private apiDeltaT =
    "http://172.31.60.248:8080/api/donnees-climatiques/Alldelta/";
  private readonly apiMsg = "http://172.31.60.248:8080/api/requetesLLM";
  private userMsg = "http://172.31.60.248:8080/api/requetesLLM/utilisateur/";

  constructor(private http: HttpClient) {}

  /**
   * Fetches the localisations from the API.
   * Measures and logs the response time of the GET request.
   *
   * @returns An Observable emitting the localisation data.
   */

  getLocalisations(): Observable<any> {
    const debut = performance.now(); 
  
    return this.http.get(this.apiUrl_localisation).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET Localisations: ${temps.toFixed(2)} ms`);
      })
    );
  }
  

  /**
   * Fetches the total number of data records from the API.
   * Measures and logs the response time of the GET request.
   * 
   * @returns An Observable emitting the total number of data records.
   */
  getTotal(): Observable<any> {
    const debut = performance.now(); 
  
    return this.http.get(this.apiClimatTotal).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET Total: ${temps.toFixed(2)} ms`);
      })
    );
  }


  /**
   * Fetches the data for a given station and date range from the API.
   * 
   * @param numStation The number of the station to retrieve data for.
   * @param date The date for which to retrieve data. The returned data will be for the week ending on this date.
   * @returns An Observable emitting the retrieved data.
   */
  getInfo(numStation: number, date: string): Observable<any> {
    console.log("Date reçue:", date);
  
    let dateFin = new Date(date);
    console.log("véritable date de fin:", dateFin);
    dateFin.setDate(dateFin.getDate() + 1);
    let dateFinFormatted = dateFin.toISOString().split("T")[0];
  
    let dateF = new Date(dateFin);
    let dateDebut = new Date(dateF);
    dateDebut.setDate(dateDebut.getDate() - 7);
    let dateDebutFormatted = dateDebut.toISOString().split("T")[0];
  
    console.log(
      "Date de début:",
      dateDebutFormatted,
      "| Date de fin:",
      dateFin
    );
  
    let url =
      this.apiInfoCity +
      numStation +
      "?dateDebut=" +
      dateFin +
      "&dateFin=" +
      dateDebutFormatted;
  
    console.log("URL appélé: ", url);
  
    const debut = performance.now();
  
    return this.http.get(
      this.apiInfoCity +
        numStation +
        "?dateDebut=" +
        dateDebutFormatted +
        "&dateFin=" +
        dateFinFormatted
    ).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET Info: ${temps.toFixed(2)} ms`);
      })
    );
  }
  

/**
 * Fetches the yearly statistics for a given station from the API.
 * Measures and logs the response time of the GET request.
 *
 * @param numStation The station number for which to retrieve yearly statistics.
 * @returns An Observable emitting the yearly statistics data.
 */
  getYearlyStats(numStation: number): Observable<any> {
    const debut = performance.now(); 
  
    return this.http.get(this.apiYearlyStat + numStation).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET YearlyStats: ${temps.toFixed(2)} ms`);
      })
    );
  }
  


/**
 * Fetches the weekly statistics for a given station and year from the API.
 * Measures and logs the response time of the GET request.
 *
 * @param numStation The station number for which to retrieve weekly statistics.
 * @param year The year for which to retrieve the weekly statistics.
 * @returns An Observable emitting the weekly statistics data.
 */

  getWeeklyStats(numStation: number, year: number): Observable<any> {
    const debut = performance.now(); 
  
    return this.http.get(this.apiWeeklyStat + numStation + "?annee=" + year).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET WeeklyStats: ${temps.toFixed(2)} ms`);
      })
    );
  }
  

  /**
   * Fetches the daily statistics for a given year and month from the API.
   * Measures and logs the response time of the GET request.
   *
   * @param year The year for which to retrieve the daily statistics.
   * @param month The month for which to retrieve the daily statistics.
   * @returns An Observable emitting the daily statistics data.
   */
  getDailyStats(year: number, month: number): Observable<any> {
    console.log("URL Daily appélé: ", this.apiDailyStat + "?mois=" + month + "&annee=" + year);
  
    const debut = performance.now(); 
  
    return this.http.get(this.apiDailyStat + "?mois=" + month + "&annee=" + year).pipe(
      tap(() => {
        const fin = performance.now();
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET (table DonneesClimatiques_jeux) : ${temps.toFixed(2)} ms`);
      })
    );
  }
  

  /**
   * Fetches the daily statistics for a given year and month from the API, adapted for the Visualization component.
   * Measures and logs the response time of the GET request.
   *
   * @param year The year for which to retrieve the daily statistics.
   * @param month The month for which to retrieve the daily statistics.
   * @returns An Observable emitting the daily statistics data.
   */
  getDailyStatsVUE(year: number, month: number): Observable<any> {
    console.log("URL Daily_Vue appélé: ", this.apiDailyStatVUE + "?mois=" + month + "&annee=" + year);
    
    const debut = performance.now(); 
    
    return this.http.get(this.apiDailyStatVUE + "?mois=" + month + "&annee=" + year).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET Daily_Vue: ${temps.toFixed(2)} ms`);
      })
    );
  }

/**
 * Fetches the average statistics from the API.
 * Measures and logs the response time of the GET request.
 *
 * @returns An Observable emitting the average statistics data.
 */

  getAvergeStats() {
    const debut = performance.now(); 
  
    return this.http.get(this.apiAverage).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET AverageStats: ${temps.toFixed(2)} ms`);
      })
    );
  }
  

  /**
   * Fetches the top 15 days with the highest temperatures in France.
   *
   * @returns An Observable emitting the top 15 days with the highest temperatures.
   */
  getTopCanicule() {
    return this.http.get(this.apiTopCanicule);
  }

  /**
   * Fetches the top 15 days with the lowest temperatures in France.
   *
   * @returns An Observable emitting the top 15 days with the lowest temperatures.
   */
  getTopFroid() {
    return this.http.get(this.apiTopFroid);
  }

  /**
   * Fetches the yearly delta temperatures for a given station number from the API.
   * Measures and logs the response time of the GET request.
   * @param numStation The station number for which to retrieve the yearly delta temperatures.
   * @returns An Observable emitting the yearly delta temperatures data.
   */
  getDeltaTemperatures(numStation: number){
    const debut = performance.now(); 
    console.log("URL Delta appélé: ", this.apiDeltaT+numStation);
    return this.http.get(this.apiDeltaT+numStation).pipe(
      tap(() => {
        const fin = performance.now(); 
        const temps = fin - debut; 
        console.log(`Temps de réponse de la requête GET DeltaTemperatures: ${temps.toFixed(2)} ms`);
      })
    );
  }
}
