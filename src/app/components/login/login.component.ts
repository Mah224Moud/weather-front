import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { of } from "rxjs";
import { LoginService } from "../../services/login.service";
import { UserInfo } from "../../models/userInfo";
import { AuthService } from "../../services/auth.service";

declare var bootstrap: any;

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage: string = "";
  userInfo: UserInfo = { email: "", nom: "", prenom: "", id: 0 };

  showLoginForm: boolean = true;
  showRegisterForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  /**
   * Logs in a user with the provided email and password.
   * Calls the login() method of the LoginService.
   * If the response is truthy, calls the getUserInfo() method and logs the user in.
   * If the response is falsy, shows a toast with a warning message.
   * On error, logs the error to the console.
   * @param email - The email address of the user to log in.
   * @param password - The password for the user's account.
   */
  login(email: string, password: string): void {
    this.loginService.login(email, password).subscribe({
      next: (response) => {
        if (response) {
          this.getUserInfo(email);

          setTimeout(() => {
            this.authService.login(this.userInfo);
            this.router.navigate(["/"]);
          }, 500);
        } else {
          this.showToast("Email ou mot de passe incorrect.", "warning");
        }
      },
      error: (err) => {
        console.error("Erreur lors de la tentative de connexion:", err);
      },
    });
  }

  /**
   * Registers a new user with the provided details.
   * Initiates a registration request via the LoginService and handles the response.
   * On successful registration, displays a success message and resets the registration form.
   * On error, displays an error message.
   *
   * @param lastName - The last name of the user to be registered.
   * @param firstName - The first name of the user to be registered.
   * @param email - The email address of the user to be registered.
   * @param password - The password for the user's account.
   */
  registration(
    lastName: string,
    firstName: string,
    email: string,
    password: string
  ): void {
    this.loginService
      .registration(lastName, firstName, email, password)
      .subscribe({
        next: (response) => {
          console.log("✅ Utilisateur ajouté avec succès :", response);
          this.showToast("Votre compte à été crée avec succès !!!");

          this.registerForm.reset();
          this.showLoginForm = true;
          this.showRegisterForm = false;
        },
        error: (error) => {
          console.error("❌ Erreur lors de l'inscription :", error);
          this.showToast(
            "Une erreur est survenue lors de l'inscription.",
            "danger"
          );
        },
      });
  }

  /**
   * Attempts to log in a user with the provided details.
   * If the form is valid, calls the login() method.
   * If the form is invalid, displays a warning message.
   */
  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.login(email, password);
    } else {
      this.showToast("Le formulaire de connexion est invalide.", "warning");
    }
  }

  /**
   * Recupere les informations d'un utilisateur en fonction de son email.
   * Fait une requete GET a l'API avec l'email en parametre.
   * Stocke les informations de l'utilisateur dans this.userInfo.
   * Affiche un toast avec un message de bienvenue.
   * Affiche les informations de l'utilisateur dans la console.
   * @param email - L'email de l'utilisateur.
   */
  getUserInfo(email: string): void {
    this.loginService.getUserInfo(email).subscribe({
      next: (response) => {
        this.userInfo.email = response.email;
        this.userInfo.nom = response.nom;
        this.userInfo.prenom = response.prenom;
        this.userInfo.id = response.id;

        this.showToast(
          "Bonjour, " + this.userInfo.prenom.toLocaleUpperCase(),
          "success"
        );

        console.log(this.userInfo);
      },
      error: (error) => {
        console.error(
          "❌ Erreur lors de lors de la recup des infos Utilisateur avec le mail: " +
            email,
          error
        );
      },
    });
  }

  /**
   * Registers a new user with the provided details.
   * If the form is valid, calls the registration() method.
   * If the form is invalid, displays a warning message.
   */
  onRegister() {
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password } = this.registerForm.value;
      this.showToast(
        `Inscription réussie pour ${firstName} ${lastName} !`,
        "success"
      );

      this.registration(lastName, firstName, email, password);
    } else {
      this.showToast("Veuillez remplir correctement le formulaire.", "warning");
    }
  }

  /**
   * Affiche un toast avec un message et un type de message (succès, danger, avertissement, info).
   * Si le toast est déjà affiché, le remplace par le nouveau.
   * Si le type est omis, prend la valeur par défaut "success".
   *
   * @param message - Le message à afficher.
   * @param type - Le type de message (par défaut "success").
   */
  showToast(message: string, type: string = "success") {
    const toastLiveExample = document.getElementById("liveToast");
    if (toastLiveExample) {
      const toastBody = toastLiveExample.querySelector(".toast-body");
      if (toastBody) {
        toastBody.textContent = message;
      }

      toastLiveExample.classList.remove(
        "bg-success",
        "bg-danger",
        "bg-warning",
        "bg-info",
        "text-white"
      );
      toastLiveExample.classList.add(`bg-${type}`, "text-white");

      const toastBootstrap = new bootstrap.Toast(toastLiveExample);
      toastBootstrap.show();

      setTimeout(() => {
        toastLiveExample.classList.remove(`bg-${type}`);
      }, 5000);
    }
  }

  /**
   * Inverse l'affichage des deux formulaires de connexion et d'inscription.
   * Empêche le comportement par défaut du formulaire (recharge de la page).
   *
   * @param event - L'événement du formulaire.
   */
  toggleForms(event: Event) {
    event.preventDefault();
    this.showLoginForm = !this.showLoginForm;
    this.showRegisterForm = !this.showRegisterForm;
  }
}
