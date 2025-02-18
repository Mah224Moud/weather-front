import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClient, HttpClientModule} from '@angular/common/http';  // Importation de HttpClientModule

import { AppComponent } from './app.component';
import { VisualizationComponent } from './components/visualization/visualization.component';
import {CommonModule} from '@angular/common';
import {DataService} from './data.service';  // Exemple
import { FormsModule } from '@angular/forms';
import { InterfacemeteoComponent } from './components/interfacemeteo/interfacemeteo.component';  // Importer FormsModule ici
import { DataConsultationComponent } from './components/data-consultation/data-consultation.component';
@NgModule({
  declarations: [
    AppComponent,
    DataConsultationComponent,
    VisualizationComponent,  // Assurez-vous que vos composants sont déclarés ici
    InterfacemeteoComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,// Ajout du HttpClientModule ici
    CommonModule,
    FormsModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
