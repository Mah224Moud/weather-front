import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DataService } from '../../data.service';
import { City } from '../../models/city';
import { YearlyStat } from '../../models/yearly_stat';

@Component({
  selector: 'app-visualization',
  standalone: true,
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css'],
  imports: [CommonModule, FormsModule, NgxChartsModule], 
})
export class VisualizationComponent implements OnInit {
  data: any[] = [];
  isLoading: boolean = false;
  cities: City[] = [];
  rawData: YearlyStat[] = [];
  searchCity: string = '';
  showSuggestions: boolean = false;
  filteredCities: City[] = [];
  infoCity: City = { id: 0, numeroStation: 0, ville: '', latitude: 0, longitude: 0, altitude: 0 };

  view: [number, number] = [window.innerWidth * 0.9, 600]; 
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Année';
  showYAxisLabel = true;
  yAxisLabel = 'Valeurs';


  years: number[] = [];
  selectedYear: number = new Date().getFullYear();


  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getLocations();
    window.addEventListener('resize', this.onResize);
    this.populateYears();
  }

  onResize = () => {
    this.view = [window.innerWidth * 0.9, 600]; 
  };
  
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }


  generateChart(numStation: number){
    this.isLoading = true;
    this.getYearlyStats(numStation);
  
    setTimeout(() => {
    this.updateChart();
    this.isLoading = false;
    },1000);
  }

  populateYears() {
    const startYear = 1996;
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }
  
  onYearChange(event: any) {
    this.selectedYear = event.target.value;
  }

  private updateChart() {
    const keys = ["temperature", "pression", "wind_speed", "precipitation"];
  
    this.data = keys.map(key => ({
      name: key,
      series: this.rawData.map(item => ({
        name: item.annee.toString(),
        value: key === "precipitation" 
          ? (item[key as keyof YearlyStat] as number) / 10 
          : item[key as keyof YearlyStat]
      }))
    }));
  
    console.log("Graphique mis à jour", this.data);
}

  
clearSearch() {
  this.searchCity = '';
  this.filteredCities = [];
  this.showSuggestions = false;
}
  

  private getYearlyStats(num_station: number): void {
    this.dataService.getYearlyStats(num_station).subscribe({
      next: (response: any) => {
        this.rawData = response;
        console.log("Chargement des données: ", this.rawData);
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }


    private getLocations(): void {
      this.dataService.getLocalisations().subscribe({
        next: (response: City[]) => {
          this.cities = response;
          console.log('Villes chargées:', this.cities);
          
          const c = this.cities.find(c => c.ville.includes('DIJON')) || this.cities[0];
          if ( c ) {
            this.searchCity =  c .ville;
            this.infoCity = c;
            this.generateChart(c.numeroStation);
          }
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
    }

    onSearchInput() {
      if (this.searchCity.trim()) {
        this.showSuggestions = true;
        this.filteredCities = this.cities.filter(city =>
          city.ville.toLowerCase().includes(this.searchCity.toLowerCase())
        );
      } else {
        this.showSuggestions = false;
        this.filteredCities = [];
      }
    }
  
    selectCity(city: City) {
      this.searchCity = city.ville;
      this.showSuggestions = false;
      this.infoCity = city;
      this.generateChart(city.numeroStation);
    }
}
