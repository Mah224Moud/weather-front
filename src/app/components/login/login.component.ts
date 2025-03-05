import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private apiUrl = 'http://172.31.60.248:8080/api/utilisateurs';
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoggedIn: boolean = false;
  adminMode: boolean = false;
  loggedInUser: any = null;
  utilisateur: any = null;
  errorMessage: string = '';



  showLoginForm: boolean = true;
  showRegisterForm: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /** ✅ Correction : Envoi des paramètres au format attendu par le backend */
  VerifPassword(email: string, motDePasse: string): Observable<{ success: boolean }> {
    const params = new HttpParams()
      .set('email', email)
      .set('motDePasse', motDePasse);
  
    console.log("📩 Requête envoyée à l'API :", email, motDePasse);
  
    return this.http.post<{ success: boolean }>(
      'http://172.31.60.248:8080/api/utilisateurs/login',
      null,
      { params }
    ).pipe(
      tap((response: any) => console.log("🔍 Réponse API :", response)), // ✅ Correction avec type `any`
      catchError((error: any) => {
        console.error("❌ Erreur API :", error);
        return of({ success: false }); // ✅ Correction : Utiliser `of` pour retourner un objet Observable
      })
    );
  }
  
  
  

  /** ✅ Correction : Gestion propre de la connexion */
  onLogin() {
    console.log("🔍 onLogin() a été appelé !");
    
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const motDePasse = password;
  
      console.log("📩 Données envoyées :", email, motDePasse);
  
      this.VerifPassword(email, motDePasse).subscribe({
        next: (response: any) => {
          console.log("🔍 Réponse API reçue :", response);
  
          if (response === true) {  // ✅ Correction ici
            this.isLoggedIn = true;
            this.loggedInUser = { email };
            this.showToast('Connexion réussie !', 'success');
  
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 3000);
          } else {
            this.showToast('Email ou mot de passe incorrect.', 'warning');
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur serveur lors de la connexion :', error);
          this.showToast('Erreur serveur lors de la connexion.', 'danger');
        }
      });
    } else {
      this.showToast('Le formulaire de connexion est invalide.', 'warning');
    }
  }
  
 

  /** ✅ Correction de l'URL pour récupérer un utilisateur par email */
  getUtilisateurByEmail(email: string): any {
    this.http.get<any>(`${this.apiUrl}/${email}`).subscribe({
      next: (data) => {
        this.utilisateur = data;
        console.log('✅ Utilisateur récupéré :', this.utilisateur);
      },
      error: (error) => {
        if (error.status === 404) {
          this.errorMessage = '❌ Utilisateur non trouvé';
        } else {
          this.errorMessage = '❌ Une erreur est survenue lors de la récupération de l\'utilisateur';
        }
        console.error('❌ Erreur :', error);
      }
    });
  }

  /** Reste du code inchangé */
  CreeUser(nom: string, prenom: string, email: string, motDePasse: string): Observable<any> {
    const utilisateur = { nom, prenom, email, motDePasse };
    console.log("📨 Envoi des données utilisateur :", utilisateur);

    return this.http.post(this.apiUrl, utilisateur, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password } = this.registerForm.value;

      const cache: { firstName: string; lastName: string; email: string; password: string }[] =
        JSON.parse(localStorage.getItem('userCache') || '[]');

      if (cache.some(user => user.email === email)) {
        this.showToast('Cet email est déjà inscrit.', 'danger');
        return;
      }

      cache.push({ firstName, lastName, email, password });
      localStorage.setItem('userCache', JSON.stringify(cache));

      this.showToast(`Inscription réussie pour ${firstName} ${lastName} !`, 'success');

      this.CreeUser(lastName, firstName, email, password).subscribe({
        next: (response) => {
          console.log("✅ Utilisateur ajouté avec succès :", response);
          this.showToast('Utilisateur enregistré en base de données avec succès !', 'success');

          this.registerForm.reset();
          this.showLoginForm = true;
          this.showRegisterForm = false;
        },
        error: (error) => {
          console.error("❌ Erreur lors de l'inscription :", error);
          this.showToast("Une erreur est survenue lors de l'inscription.", 'danger');
        }
      });
    } else {
      this.showToast("Veuillez remplir correctement le formulaire.", 'warning');
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.loggedInUser = null;
    this.adminMode = false;

    this.showToast('Déconnexion réussie.', 'info');

    this.showLoginForm = true;
    this.showRegisterForm = false;
  }

  showToast(message: string, type: string = 'success') {
    const toastLiveExample = document.getElementById('liveToast');
    if (toastLiveExample) {
      const toastBody = toastLiveExample.querySelector('.toast-body');
      if (toastBody) {
        toastBody.textContent = message;
      }

      toastLiveExample.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white');
      toastLiveExample.classList.add(`bg-${type}`, 'text-white');

      const toastBootstrap = new bootstrap.Toast(toastLiveExample);
      toastBootstrap.show();

      setTimeout(() => {
        toastLiveExample.classList.remove(`bg-${type}`);
      }, 5000);
    }
  }

  showCacheData() {
    const cache = localStorage.getItem('userCache');
    if (cache) {
      this.showToast(`Données du cache : ${cache}`, 'info');
    } else {
      this.showToast('Aucune donnée dans le cache.', 'warning');
    }
  }

  clearCache() {
    localStorage.removeItem('userCache');
    this.showToast('Cache nettoyé avec succès.', 'danger');
  }

  toggleForms(event: Event) {
    event.preventDefault();
    this.showLoginForm = !this.showLoginForm;
    this.showRegisterForm = !this.showRegisterForm;
  }
}
