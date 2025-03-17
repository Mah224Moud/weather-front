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


  /**
   * Calls the DataService to retrieve yearly statistics for a given station number.
   * Calls the updateChart and updateExtremeChart functions to update the charts.
   * @param numStation The station number for which to retrieve yearly statistics.
   */
  generateChart(numStation: number){
    this.isLoading = true;
    this.getYearlyStats(numStation);
  
    setTimeout(() => {
    this.updateChart();
    this.updateExtremeChart();
    this.isLoading = false;
    },2500);
  }


  /**
   * Calls the DataService to retrieve yearly delta temperatures for a given station number.
   * Calls the updateDeltaChart function to update the delta chart.
   * @param numStation The station number for which to retrieve yearly delta temperatures.
   */
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

  /**
   * Takes a date string and returns a string in the format 'YYYY-YYYY' 
   * where the first year is the year of the given date minus one.
   * @param dateString The date string to format.
   * @returns A string in the format 'YYYY-YYYY'.
   */

  formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  
  const previousYear = year - 1;
  return `${previousYear}-${year}`;
}


/**
 * Populates the `years` array with a range of years starting from 1996
 * up to the current year.
 */

  populateYears() {
    const startYear = 1996;
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }

  
  /**
   * Populates the `months` array with numbers from 1 to 12.
   */
  populateMonths() {
    this.months = Array.from({ length: 12 }, (_, i) => i + 1);
  }
  
  
  /**
   * Handles the year dropdown selection change event.
   * @param event The change event.
   */
  onYearChange(event: any) {
    this.selectedYear = event.target.value;
    this.generateWeeklyChart(this.infoCity.numeroStation, this.selectedYear);
    this.generateDailyBarChart(this.selectedYear, this.selectedMonth);
    this.generateDailyBarChart2(this.selectedYear, this.selectedMonth);
  }

  /**
   * Handles the month dropdown selection change event.
   * @param event The change event.
   */
  onMonthChange(event: any) {
    this.selectedMonth = event.target.value;
    this.generateDailyBarChart(this.selectedYear, this.selectedMonth);
    this.generateDailyBarChart2(this.selectedYear, this.selectedMonth);
  }


  /**
   * Updates the data array for the yearly statistics chart.
   * 
   * Maps over the keys array to create a data object for each key.
   * Each data object contains the key name and an array of series,
   * where each series is an object with a name and a value.
   * 
   * If the key is "precipitation", the value is divided by 10.
   */
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



  /**
   * Updates the extreme data array for the extreme statistics chart.
   * 
   * This data array contains four objects, each with a name and a value.
   * The name is a string that describes the extreme value, and the value is the value of the extreme.
   * 
   * The first two objects are for the maximum and minimum temperatures, and the last two are for the maximum and minimum precipitation.
   * 
   * The reduce function is used to find the maximum and minimum values for each type of data.
   * 
   * The data is filtered to exclude the year 2025, since it is not a valid year.
   */
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
    
/**
 * Clears the search input and suggestions list.
 * Resets the search city to an empty string, clears the filtered cities array,
 * and hides the suggestions dropdown.
 */

  clearSearch() {
    this.searchCity = '';
    this.filteredCities = [];
    this.showSuggestions = false;
  }
  
  /**
   * Gets the yearly statistics for a given station number.
   * Subscribes to the DataService yearly statistics observable and sets the component's
   * `rawData` property to the response.
   * If there is an error, logs the error to the console.
   * @param num_station The station number for which to retrieve the yearly statistics.
   */
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

  /**
   * Subscribes to the DataService average statistics observable and sets the component's
   * `averge` property to the response.
   * If there is an error, logs the error to the console.
   * Also prepares the pie chart data by calling `preparePieChartData`.
   */
  private getAvergeStats(): void {
    this.dataService.getAvergeStats().subscribe({
      next: (response: any) => {
        this.averge = response;
        this.preparePieChartData();
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  /**
   * Prepares the pie chart data by grouping the average statistics by category.
   * 
   * The categories are:
   * - Baisse significative (< 0°C)
   * - Stable ou légère hausse (0°C à 1°C)
   * - Hausse modérée (1°C à 2°C)
   * - Hausse marquée (2°C à 3°C)
   * - Forte hausse (> 3°C)
   * 
   * The function iterates over the average statistics and assigns each station to a category based on its delta temperature.
   * The number of stations in each category is then used to create the pie chart data.
   * The average statistics details are also stored in the `averageStatDetails` property.
   */
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
  
  
  /**
   * Subscribes to DataService's getWeeklyStats to get weekly statistics for the given station and year.
   * Stores the received data in this.rawWeeklyData.
   * @param num_station The station number for which to retrieve weekly statistics.
   * @param year The year of the weekly statistics to retrieve.
   */
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

/**
 * Retrieves the delta temperature data for a given station number.
 * Subscribes to the DataService's delta temperature observable and sets
 * the component's `rawDeltaData` property to the response.
 * Logs the loaded delta data to the console.
 * If there is an error, logs the error to the console.
 * @param numeroStation The station number for which to retrieve delta temperature data.
 */

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

  /**
   * Subscribes to DataService's getDailyStats to get daily statistics for the given year and month.
   * Stores the received data in this.rawDailyData.
   * @param year The year of the daily statistics to retrieve.
   * @param month The month of the daily statistics to retrieve.
   */
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

  /**
   * Subscribes to DataService's getDailyStatsVUE to get daily statistics for the given year and month.
   * Stores the received data in this.rawDailyData2.
   * @param year The year of the daily statistics to retrieve.
   * @param month The month of the daily statistics to retrieve.
   */
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

  /**
   * Subscribes to DataService's getTopCanicule to get the top 15 temperatures recorded in France.
   * Stores the received data in this.rawCanicule.
   */
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

/**
 * Subscribes to DataService's getTopFroid to get the top 15 coldest temperatures recorded in France.
 * Stores the received data in this.rawFroid.
 * Logs any error encountered during the data retrieval to the console.
 */

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


  /**
   * Updates the weekly chart by mapping the raw weekly data to a format suitable
   * for the chart component.
   *
   * If the raw weekly data is empty, logs a warning and returns without doing
   * anything.
   *
   * Otherwise, maps the raw weekly data to an array of objects with two
   * properties: `name` and `series`. The `name` property is the name of the
   * series as it should be displayed in the chart, and the `series` property is
   * an array of objects with two properties each: `name` and `value`. The `name`
   * property is the name of the data point (e.g. "Semaine 1"), and the `value`
   * property is the value of the data point.
   *
   * The mapping is done using an object `keyMapping` that defines the mapping
   * between the property names in the raw data and the display names for the
   * series.
   */
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

  /**
   * Updates the daily chart by mapping the raw daily data to a format suitable
   * for the chart component.
   *
   * If the raw daily data is empty, logs a warning and returns without doing
   * anything.
   *
   * Otherwise, maps the raw daily data to an array of objects with two
   * properties: `name` and `value`. The `name` property is the date of the
   * data point, and the `value` property is the value of the data point.
   *
   * The mapping is done using the first element of each tuple in the raw daily
   * data as the `name`, and the second element as the `value`.
   */
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

  
  /**
   * Subscribes to the location data service and assigns the response to the
   * `cities` property.
   *
   * If the response is not empty, finds the city of DIJON in the response and
   * assigns it to the `infoCity` property. If no such city is found, assigns the
   * first city in the response to `infoCity`.
   *
   * Calls the `generateChart`, `generateWeeklyChart` and `generateChartDelta`
   * methods with the `numeroStation` property of the assigned city.
   */
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

  /**
   * Called when the user types in the search bar.
   *
   * If the search input is not empty, filters the list of cities based on the
   * search query and shows the suggestions list.
   * If the search input is empty, hides the suggestions list and clears the
   * filtered cities list.
   */
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

/**
 * Generates the weekly chart data for a given station and year.
 * 
 * Initiates a loading state and retrieves the weekly statistics
 * for the specified station number and year. After a delay, updates
 * the weekly chart with the retrieved data and ends the loading state.
 * 
 * @param num_station The station number for which to generate the weekly chart.
 * @param year The year for which to generate the weekly chart data.
 */

    generateWeeklyChart(num_station: number, year: number){
      this.isLoading = true;
      this.getWeeklyStats(num_station, year);
    
      setTimeout(() => {
      this.updateWeeklyChart();
      this.isLoading = false;
      },2000);
    }



    /**
     * Generates the daily bar chart data for a given year and month.
     * 
     * Initiates a loading state and retrieves the daily statistics
     * for the specified year and month. After a delay, updates
     * the daily chart with the retrieved data and ends the loading state.
     * 
     * @param year The year for which to generate the daily bar chart data.
     * @param month The month for which to generate the daily bar chart data.
     */
    generateDailyBarChart(year: number, month: number){
      this.isLoading = true;
      this.getDailyStats(year, month);
    
      setTimeout(() => {
      this.updateDailyChart();
      this.isLoading = false;
      },3000);
    }

    /**
     * Generates the daily bar chart data for a given year and month.
     * 
     * Initiates a loading state and retrieves the daily statistics
     * for the specified year and month. After a delay, updates
     * the daily chart with the retrieved data and ends the loading state.
     * 
     * @param year The year for which to generate the daily bar chart data.
     * @param month The month for which to generate the daily bar chart data.
     */
    generateDailyBarChart2(year: number, month: number){
      this.isLoading = true;
      this.getDailyStats2(year, month);
    
      setTimeout(() => {
      this.updateDailyChart2();
      this.isLoading = false;
      },2000);
    }

    /**
     * Generates the top canicule chart data.
     * 
     * Initiates a loading state and retrieves the top canicule statistics.
     * After a delay, ends the loading state.
     */
    generateChartTopChaud(){
      this.isLoading = true;
      this.getCanicule();
    
      setTimeout(() => {
      this.isLoading = false;
      },1000);
    }

    /**
     * Generates the top froid chart data.
     * 
     * Initiates a loading state and retrieves the top froid statistics.
     * After a delay, ends the loading state.
     */
    generateChartTopFroid(){
      this.isLoading = true;
      this.getFroid();
    
      setTimeout(() => {
      this.isLoading = false;
      },1000);
    }
    /**
     * Called when a city is selected from the suggestions list.
     * 
     * Sets the search input to the selected city name, hides the suggestions
     * list, sets the infoCity property to the selected city, and generates
     * the charts for the selected city.
     * 
     * @param city The selected city object.
     */

    selectCity(city: City) {
      this.searchCity = city.ville;
      this.showSuggestions = false;
      this.infoCity = city;
      this.generateChart(city.numeroStation);
      this.generateWeeklyChart(city.numeroStation, this.selectedYear);
      this.generateChartDelta(city.numeroStation)
    }
}

