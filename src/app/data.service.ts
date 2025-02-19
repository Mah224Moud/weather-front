import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Observable, throwError, forkJoin, map} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl_localisation = 'http://172.31.60.248:8080/api/localisations'
  private apiClimatTotal = "http://172.31.60.248:8080/api/donnees-climatiques/count"
  private apiInfoCity =  "http://172.31.60.248:8080/api/donnees-climatiques/info/"
  private apiYearlyStat = "http://172.31.60.248:8080/api/donnees-climatiques/moyenneAll/"
  private apiUrl = 'http://localhost:11434/api/generate';
  private apiUrl_donneclimatique = 'http://172.31.60.248:8080/api/donnees-climatiques'
  private apiWeeklyStat= "http://172.31.60.248:8080/api/donnees-climatiques/moyennes/"

  constructor(private http: HttpClient) {}
 
  getLocalisations() : Observable<any> {
    return this.http.get(this.apiUrl_localisation);
  }

  getTotal(): Observable<any> {
    return this.http.get(this.apiClimatTotal);
  }

  getInfo(numStation: number, date: string): Observable<any> {
    console.log("Date reçue:", date);

    let dateFin = new Date(date);
    console.log("vetitable date de fin:", dateFin);
    dateFin.setDate(dateFin.getDate()+1)
    let dateFinFormatted = dateFin.toISOString().split('T')[0];
  
    let dateF = new Date(dateFin);
  
    let dateDebut = new Date(dateF);
    dateDebut.setDate(dateDebut.getDate() - 7);
    let dateDebutFormatted = dateDebut.toISOString().split('T')[0];
  
    console.log("Date de début:", dateDebutFormatted, "| Date de fin:",dateFin);

    let url = this.apiInfoCity + numStation + "?dateDebut=" + dateFin + "&dateFin=" + dateDebutFormatted;

    console.log("URL appélé: ", url);
  
    return this.http.get(this.apiInfoCity+numStation+"?dateDebut="+dateDebutFormatted+"&dateFin="+dateFinFormatted);
  }
  
  getYearlyStats(numStation: number): Observable<any> {
    return this.http.get(this.apiYearlyStat+numStation);
  }

  getWeeklyStats(numStation: number, year: number): Observable<any> {
    return this.http.get(this.apiWeeklyStat+numStation+"?annee="+year);
  }


  sendMessage(msg: string): Observable<string> {
    const table = `
      Vous consultez une base de données contenant les tables suivantes :

      ### Table "produit"
      - id (INT, clé primaire, auto-incrémentée)
      - nom (VARCHAR(100), obligatoire) → Nom du produit
      - description (TEXT) → Description du produit
      - prix (DECIMAL(10,2), obligatoire) → Prix du produit
      - stock (INT, obligatoire) → Nombre d’unités en stock

      ### Table "achat"
      - id (INT, clé primaire, auto-incrémentée)
      - produit_id (INT, clé étrangère vers "produit.id")
      - quantite (INT, obligatoire) → Quantité achetée
      - date_achat (DATETIME, par défaut la date et l'heure actuelle)

      ---

      📌 **Règles strictes de réponse :**  
      1. **Si la question concerne les tables ci-dessus**, alors :  
        - Génère **uniquement une requête SQL valide** liée aux tables "produit" et "achat".  
        - Fournit une explication claire et concise de la requête.  
      2. **Si la question n’a aucun lien avec SQL sur ces tables, alors affiche UNIQUEMENT ce message et RIEN D'AUTRE :**  

      👉 Bonjour, je ne réponds qu’aux questions SQL sur les tables "produit" et "achat". Merci ! 😊  

      🚨 **Ne génère AUCUNE requête SQL si la question n'est pas pertinente.**
      ❌ **Ne donne AUCUNE explication ni information supplémentaire.**
    `;
  
    const data = {
      model: 'mistral',
      prompt: `${table} ${msg}`,
      stream: true
    };
  
    return new Observable<string>(observer => {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
  
        const processChunk = ({ done, value }: { done: boolean; value?: Uint8Array }) => {
          if (done) {
            if (buffer) this.parseBuffer(buffer, observer);
            observer.complete();
            return;
          }
  
          buffer += decoder.decode(value, { stream: true });
          buffer = this.parseBuffer(buffer, observer);
          
          reader.read().then(processChunk);
        };
  
        reader.read().then(processChunk);
      })
      .catch(err => observer.error(err));
    });
  }

  private parseBuffer(buffer: string, observer: any): string {
    const lines = buffer.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      try {
        const json = JSON.parse(trimmed);
        if (json.response) observer.next(json.response);
      } catch (e) {
        console.error('Erreur de parsing partiel:', e);
        return buffer;
      }
      buffer = buffer.slice(line.length + 1);
    }
    
    return buffer;
  }



  rechercherEntreDates(Ville: string, dateDebut: string, dateFin: string): Observable<any> {
    return this.http.get(`${this.apiUrl_donneclimatique}/villedate/${Ville}?dateDebut=${dateDebut}&dateFin=${dateFin}`);
  }
  
  rechercherApresDate(Ville: string,dateDebut: string): Observable<any> {
    return this.http.get(`${this.apiUrl_donneclimatique}/villedate/${Ville}?dateDebut=${dateDebut}`);
  }

  rechercherAvantDate(Ville: string, dateFin: string): Observable<any> {
    return this.http.get(`${this.apiUrl_donneclimatique}/villedate/${Ville}?dateFin=${dateFin}`);
  }

  getApidata() : Observable<any> {
    return this.http.get(this.apiUrl_donneclimatique);
  }
  
}
