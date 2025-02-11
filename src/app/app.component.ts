import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DataConsultationComponent } from './components/data-consultation/data-consultation.component';
import { InterfacemeteoComponent } from './components/interfacemeteo/interfacemeteo.component';
import { VisualizationComponent } from './components/visualization/visualization.component';
import { DataService } from './data.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-root',

  imports: [RouterModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}

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
    NgxPaginationModule
  ],
  providers: [DataService],
  bootstrap: []
})
export class AppModule {
}
