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

  /**
   * Envoie une requete GET a l'API pour recuperer les donnees climatiques
   * pour une ville et une periode de temps.
   *
   * @param Ville le nom de la ville
   * @param dateDebut la date de debut de la periode
   * @param dateFin la date de fin de la periode
   *
   * @returns un Observable qui emet les donnees climatiques
   */
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
