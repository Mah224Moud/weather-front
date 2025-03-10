import { Component, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { DataConsultationComponent } from "./components/data-consultation/data-consultation.component";
import { InterfacemeteoComponent } from "./components/interfacemeteo/interfacemeteo.component";
import { VisualizationComponent } from "./components/visualization/visualization.component";
import { DataService } from "./data.service";
import { NgxPaginationModule } from "ngx-pagination";
import { DecimalPipe } from "@angular/common";
import { AuthService } from "./services/auth.service";
import { Router } from "@angular/router";
import { UserInfo } from "./models/userInfo";

declare var bootstrap: any;
@Component({
  selector: "app-root",

  imports: [RouterModule, CommonModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  isLoggedIn = false;
  userInfo: UserInfo = { email: "", nom: "", prenom: "", id: 0 };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.user$.subscribe((user: UserInfo | null) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userInfo = user;
      }
      console.log("Status de connexion mis à jour :", this.isLoggedIn);
    });
  }

  logout() {
    this.showToast(
      "A la prochaine " + this.userInfo.prenom.toUpperCase(),
      "primary"
    );
    this.authService.logout();
    this.router.navigate(["/"]);
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
}

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    AppComponent,
    HomeComponent,
    VisualizationComponent,
    InterfacemeteoComponent,
    DataConsultationComponent,
    NgxPaginationModule,
    NgModule,
  ],
  providers: [DataService],
  bootstrap: [],
})
export class AppModule {}
