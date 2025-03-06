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
@Component({
  selector: "app-root",

  imports: [RouterModule, CommonModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  isLoggedIn = false;
  userInfo: UserInfo = { email: "", nom: "", prenom: "" };

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
    this.authService.logout();
    this.router.navigate(["/"]);
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
