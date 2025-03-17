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
  

  getTopCanicule() {
    return this.http.get(this.apiTopCanicule);
  }

  getTopFroid() {
    return this.http.get(this.apiTopFroid);
  }

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
