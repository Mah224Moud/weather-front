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
  userInfo: UserInfo = { email: "", nom: "", prenom: "" };

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

  login(email: string, password: string): void {
    this.loginService.login(email, password).subscribe({
      next: (response) => {
        if (response) {
          this.showToast("Connexion réussie !", "success");
          this.getUserInfo(email);

          setTimeout(() => {
            this.authService.login(this.userInfo);
            this.router.navigate(["/"]);
          }, 3000);
        } else {
          this.showToast("Email ou mot de passe incorrect.", "warning");
        }
      },
      error: (err) => {
        console.error("Erreur lors de la tentative de connexion:", err);
      },
    });
  }

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

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.login(email, password);
    } else {
      this.showToast("Le formulaire de connexion est invalide.", "warning");
    }
  }

  getUserInfo(email: string): void {
    this.loginService.getUserInfo(email).subscribe({
      next: (response) => {
        this.userInfo.email = response.email;
        this.userInfo.nom = response.nom;
        this.userInfo.prenom = response.prenom;

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

  toggleForms(event: Event) {
    event.preventDefault();
    this.showLoginForm = !this.showLoginForm;
    this.showRegisterForm = !this.showRegisterForm;
  }
}
