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
  num_stat = 0;

  topCanicule: any[] = [];
  topFroid: any[] = [];

  DailyData: any[] = [];
  DailyData2: any[] = [];
  weeklyData: any[] = [];
  rawWeeklyData: any[] = [];
  rawDailyData: any[] = [];
  rawDailyData2: any[] = [];
  rawDeltaData: any[] = [];
  rawCanicule: any[] = [];
  rawFroid: any[] = [];

  delta: any[] = [];
  
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
  months: number[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  
  averge: any[] = [];
  pieChartData: any[] = [];
  averageStatDetails: any[] = [];
  extremeData: any[] = [];


  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    console.warn = function() {};
    this.getLocations();
    window.addEventListener('resize', this.onResize);
    this.populateYears();
    this.populateMonths();
    this.getAvergeStats();
    this.generateDailyBarChart(this.selectedYear, this.selectedMonth);
    this.generateDailyBarChart2(this.selectedYear, this.selectedMonth);
    this.generateChartTopChaud();
    this.generateChartTopFroid();
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
    this.updateExtremeChart();
    this.isLoading = false;
    },2500);
  }

  generateChartDelta(numStation: number){
    this.isLoading = true;
    this.getDelta(numStation);
  
    setTimeout(() => {
      this.delta = this.rawDeltaData.map(item => ({
        name: this.formatDate(item[2]),  
        value: item[1]
      }));
    this.isLoading = false;
    },2000);
  }

  formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  
  const previousYear = year - 1;
  return `${previousYear}-${year}`;
}


  populateYears() {
    const startYear = 1996;
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }

  populateMonths() {
    this.months = Array.from({ length: 12 }, (_, i) => i + 1);
  }
  
  
  onYearChange(event: any) {
    this.selectedYear = event.target.value;
    this.generateWeeklyChart(this.infoCity.numeroStation, this.selectedYear);
    this.generateDailyBarChart(this.selectedYear, this.selectedMonth);
    this.generateDailyBarChart2(this.selectedYear, this.selectedMonth);
  }

  onMonthChange(event: any) {
    this.selectedMonth = event.target.value;
    this.generateDailyBarChart(this.selectedYear, this.selectedMonth);
    this.generateDailyBarChart2(this.selectedYear, this.selectedMonth);
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

}

  private updateExtremeChart() {
    const rData = this.rawData.filter(data => data.annee !== 2025);
    const maxTemp = rData.reduce((prev, curr) => (curr.temperature > prev.temperature ? curr : prev));
    const minTemp = rData.reduce((prev, curr) => (curr.temperature < prev.temperature ? curr : prev));

    const maxPrec = rData.reduce((prev, curr) => (curr.precipitation > prev.precipitation ? curr : prev));
    const minPrec = rData.reduce((prev, curr) => (curr.precipitation < prev.precipitation ? curr : prev));

    this.extremeData = [
      { name: `La moyenne des températures maximal a eu lieu en ${maxTemp.annee} et est de `, value: Math.round(maxTemp.temperature)+"°C" },
      { name: `La moyenne des températures minimal a eu lieu en ${minTemp.annee} et est de `, value: Math.round(minTemp.temperature)+"°C" },
      { name: `La moyenne des precipitations maximal a eu lieu en ${maxPrec.annee} et est de `, value: Math.round(maxPrec.precipitation / 10)+" cm" },
      { name: `La moyenne des precipitations minimal a eu lieu en ${minPrec.annee} et est de `, value: Math.round(minPrec.precipitation / 10)+" cm" }
    ];
    

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

      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getAvergeStats(): void {
    this.dataService.getAvergeStats().subscribe({
      next: (response: any) => {
        this.averge = response;
        this.preparePieChartData();
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  preparePieChartData() {
    const categories: { [key: string]: number[] } = {
      "Baisse significative (< 0°C)": [],
      "Stable ou légère hausse (0°C à 1°C)": [],
      "Hausse modérée (1°C à 2°C)": [],
      "Hausse marquée (2°C à 3°C)": [],
      "Forte hausse (> 3°C)": []
    };
  

    this.averge.forEach((station) => {
      const delta = station.deltaTemp1996vs2024;
  
      let category: string | null = null;
  
      if (delta < 0) {
        category = "Baisse significative (< 0°C)";
      } else if (delta >= 0 && delta < 1) {
        category = "Stable ou légère hausse (0°C à 1°C)";
      } else if (delta >= 1 && delta < 2) {
        category = "Hausse modérée (1°C à 2°C)";
      } else if (delta >= 2 && delta < 3) {
        category = "Hausse marquée (2°C à 3°C)";
      } else {
        category = "Forte hausse (> 3°C)";
      }
  
      if (category) {
        categories[category].push(station.station);
      }
    });
  
    this.averageStatDetails = [];
  
    Object.keys(categories).forEach((category) => {
      const stationsInCategory = categories[category];
  

      stationsInCategory.forEach((stationId) => {
        const city = this.cities.find((city) => city.numeroStation === stationId);
  
        if (city) {

          this.averageStatDetails.push({
            category,
            stationId,
            cityName: city.ville,
            latitude: city.latitude,
            longitude: city.longitude,
            altitude: city.altitude,
          });
        }
      });
    });
  
    console.log('averageStatDetails:', this.averageStatDetails);
  

    this.pieChartData = Object.keys(categories).map((key) => ({
      name: key,
      value: categories[key].length
    }));
  }
  
  
  private getWeeklyStats(num_station: number, year: number): void {
    this.dataService.getWeeklyStats(num_station, year).subscribe({
      next: (response: any) => {
        this.rawWeeklyData = response;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getDelta(numeroStation: number): void {
    this.dataService.getDeltaTemperatures(numeroStation).subscribe({
      next: (response: any) => {
        this.rawDeltaData = response;
        console.log("Chargement des données delta: ", this.rawDeltaData);
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getDailyStats(year: number, month: number): void {
    this.dataService.getDailyStats(year, month).subscribe({
      next: (response: any) => {
        this.rawDailyData = response;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getDailyStats2(year: number, month: number): void {
    this.dataService.getDailyStatsVUE(year, month).subscribe({
      next: (response: any) => {
        this.rawDailyData2 = response;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getCanicule(): void {
    this.dataService.getTopCanicule().subscribe({
      next: (response: any) => {
        this.rawCanicule = response;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getFroid(): void {
    this.dataService.getTopFroid().subscribe({
      next: (response: any) => {
        this.rawFroid = response;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }


  private updateWeeklyChart() {
    if (!this.rawWeeklyData || this.rawWeeklyData.length === 0) {
      console.warn("❌ Données hebdomadaires non disponibles !");
      return;
    }
  
    const keyMapping: Record<string, string> = {
      moyenneTemp: "Température Moyenne",
      moyenneVitesseVent: "Vitesse Moyenne du Vent",
      moyennePrecip12: "Précipitations Moyennes",
      moyenneRafale10: "Rafales de Vent Moyennes"
    };
  
    this.weeklyData = Object.keys(keyMapping).map(key => ({
      name: keyMapping[key],
      series: this.rawWeeklyData
        .filter(item => item.hasOwnProperty(key))
        .map(item => ({
          name: `Semaine ${item.semaine}`,
          value: item[key as keyof typeof this.rawWeeklyData[0]] ?? 0
        }))
    }));
  }

  private updateDailyChart() {
    if (!this.rawDailyData || this.rawDailyData.length === 0) {
      console.warn("❌ Données journalier non disponibles !");
      return;
    }
    this.DailyData = this.rawDailyData.map(item => ({
      name: item[0],  
      value: item[1] 
    }));
  }
  private updateDailyChart2() {
    if (!this.rawDailyData2 || this.rawDailyData2.length === 0) {
      console.warn("❌ Données journalier non disponibles !");
      return;
    }
    this.DailyData2 = this.rawDailyData2.map(item => ({
      name: item[0],  
      value: item[1] 
    }));
  }

    private getLocations(): void {
      this.dataService.getLocalisations().subscribe({
        next: (response: City[]) => {
          this.cities = response;
          
          const c = this.cities.find(c => c.ville.includes('DIJON')) || this.cities[0];
          if ( c ) {
            this.searchCity =  c .ville;
            this.infoCity = c;
            this.generateChart(c.numeroStation);
            this.generateWeeklyChart(c.numeroStation, this.selectedYear);
            this.generateChartDelta(c.numeroStation)
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

    generateWeeklyChart(num_station: number, year: number){
      this.isLoading = true;
      this.getWeeklyStats(num_station, year);
    
      setTimeout(() => {
      this.updateWeeklyChart();
      this.isLoading = false;
      },2000);
    }

    generateDailyBarChart(year: number, month: number){
      this.isLoading = true;
      this.getDailyStats(year, month);
    
      setTimeout(() => {
      this.updateDailyChart();
      this.isLoading = false;
      },3000);
    }

    generateDailyBarChart2(year: number, month: number){
      this.isLoading = true;
      this.getDailyStats2(year, month);
    
      setTimeout(() => {
      this.updateDailyChart2();
      this.isLoading = false;
      },2000);
    }

    generateChartTopChaud(){
      this.isLoading = true;
      this.getCanicule();
    
      setTimeout(() => {
      this.isLoading = false;
      },1000);
    }

    generateChartTopFroid(){
      this.isLoading = true;
      this.getFroid();
    
      setTimeout(() => {
      this.isLoading = false;
      },1000);
    }
    selectCity(city: City) {
      this.searchCity = city.ville;
      this.showSuggestions = false;
      this.infoCity = city;
      this.generateChart(city.numeroStation);
      this.generateWeeklyChart(city.numeroStation, this.selectedYear);
      this.generateChartDelta(city.numeroStation)
    }
}
