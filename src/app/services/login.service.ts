import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable, tap, catchError, of } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class LoginService {
  private url = "http://172.31.60.248:8080/api/utilisateurs/";
  private loginUrl = "http://172.31.60.248:8080/api/utilisateurs/login";
  private registrationUrl = "http://172.31.60.248:8080/api/utilisateurs";
  constructor(private http: HttpClient) {}

  getUserInfo(email: string): Observable<any> {
    return this.http.get(this.url + email);
  }

  login(email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set("email", email)
      .set("motDePasse", password);

    return this.http
      .post<{ success: boolean }>(this.loginUrl, null, { params })
      .pipe(
        tap((response: any) => console.log("🔍 Réponse API :", response)),
        catchError((error: any) => {
          console.error("❌ Erreur API :", error);
          return of({ success: false });
        })
      );
  }

  registration(
    nom: string,
    prenom: string,
    email: string,
    motDePasse: string
  ): Observable<any> {
    const utilisateur = { nom, prenom, email, motDePasse };

    return this.http.post(this.registrationUrl, utilisateur, {
      headers: new HttpHeaders({ "Content-Type": "application/json" }),
    });
  }
}
