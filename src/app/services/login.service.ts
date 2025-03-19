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

/**
 * Attempts to log in a user with the provided email and password.
 * Sends a POST request to the authentication API endpoint with the email
 * and password as parameters.
 * Logs the API response to the console on success.
 * Catches and logs any errors during the API call and returns an observable
 * with a success property set to false in case of an error.
 *
 * @param email - The email address of the user attempting to log in.
 * @param password - The password associated with the user's email.
 * @returns An observable that emits the API response, which contains a
 *          success boolean indicating the login attempt's outcome.
 */

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

  /**
   * Registers a new user with the provided details.
   * Sends a POST request to the user registration API endpoint with the
   * user's details as parameters.
   * Logs the API response to the console on success.
   * Catches and logs any errors during the API call and returns an observable
   * with the API response.
   *
   * @param nom - The last name of the user to be registered.
   * @param prenom - The first name of the user to be registered.
   * @param email - The email address of the user to be registered.
   * @param motDePasse - The password for the user's account.
   * @returns An observable that emits the API response, which contains the
   *          newly created user's details.
   */
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
