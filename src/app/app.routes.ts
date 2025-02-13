import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DataConsultationComponent } from './components/data-consultation/data-consultation.component';
import { VisualizationComponent } from './components/visualization/visualization.component';
import { DownloadComponent } from './components/download/download.component';
import { HelpComponent } from './components/help/help.component';
import {InterfacemeteoComponent} from './components/interfacemeteo/interfacemeteo.component';
import { LlmComponent } from './components/llm/llm.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'data-consultation', component: DataConsultationComponent },
  { path: 'visualization', component: VisualizationComponent },
  { path: 'download', component: DownloadComponent },
  { path: 'help', component: HelpComponent },
  { path: 'interfacemeteo', component: InterfacemeteoComponent },
  { path: 'llm', component: LlmComponent}
];
