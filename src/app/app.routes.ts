import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { DataConsultationComponent } from "./components/data-consultation/data-consultation.component";
import { VisualizationComponent } from "./components/visualization/visualization.component";
import { InterfacemeteoComponent } from "./components/interfacemeteo/interfacemeteo.component";
import { LlmComponent } from "./components/llm/llm.component";
import { AromeComponent } from "./components/arome/arome.component";
import { AuthGuard } from "./services/guard";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "data-consultation", component: DataConsultationComponent },
  { path: "visualization", component: VisualizationComponent },
  { path: "interfacemeteo", component: InterfacemeteoComponent },
  { path: "llm", component: LlmComponent, canActivate: [AuthGuard] },
  { path: "arome", component: AromeComponent },
];
