import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoggedIn: boolean = false;
  adminMode: boolean = false; 
  loggedInUser: any = null;

  showLoginForm: boolean = true;
  showRegisterForm: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
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

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const cache = JSON.parse(localStorage.getItem('userCache') || '[]');
      const user = cache.find((u: any) => u.email === email);

      if (!user) {
        this.showToast('Email introuvable, veuillez vous inscrire.', 'danger');
      } else if (user.password !== password) {
        this.showToast('Mot de passe incorrect.', 'warning');
      } else {
        this.isLoggedIn = true;
        this.loggedInUser = user;
        this.adminMode = email === "admin@gmail.com"; 

        this.showToast(`Connexion réussie avec ${user.firstName} ${user.lastName} !`, 'success');

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }
    } else {
      this.showToast('Le formulaire de connexion est invalide.', 'warning');
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password } = this.registerForm.value;
      const cache = JSON.parse(localStorage.getItem('userCache') || '[]');

      const userExists = cache.some((user: any) => user.email === email);

      if (userExists) {
        this.showToast('Cet email est déjà inscrit.', 'danger');
      } else {
        cache.push({ firstName, lastName, email, password });
        localStorage.setItem('userCache', JSON.stringify(cache));

        this.showToast(`Inscription réussie avec ${firstName} ${lastName} !`, 'success');

        this.registerForm.reset();
        this.showLoginForm = true;
        this.showRegisterForm = false;
      }
    } else {
      this.showToast("Le formulaire d'inscription est invalide.", 'warning');
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
