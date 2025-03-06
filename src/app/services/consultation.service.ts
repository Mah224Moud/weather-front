import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { Observable, throwError, forkJoin, map } from "rxjs";


@Injectable({
  providedIn: "root",
})
export class ConsultationService {
  constructor(private http: HttpClient) {}

  private apiUrl_donneclimatique =
    "http://172.31.60.248:8080/api/donnees-climatiques";

  rechercherEntreDates(
    Ville: string,
    dateDebut: string,
    dateFin: string
  ): Observable<any> {
    console.log(
      "requete envoyé : " +
        `${this.apiUrl_donneclimatique}/villedate/${Ville}?dateDebut=${dateDebut}&dateFin=${dateFin}`
    );
    return this.http.get(
      `${this.apiUrl_donneclimatique}/villedate/${Ville}?dateDebut=${dateDebut}&dateFin=${dateFin}`
    );
  }
}
