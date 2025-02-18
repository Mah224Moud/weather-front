import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WmsService {
  private apiKey: string = "eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJtYW1vdWRvdUBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6Im1hbW91ZG91IiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJEZWZhdWx0QXBwbGljYXRpb24iLCJpZCI6MjI3NzYsInV1aWQiOiI2M2QyMmM1YS01MTY3LTRiNTAtOTc0OS1kYmQwZWE2ODk2ODgifSwiaXNzIjoiaHR0cHM6XC9cL3BvcnRhaWwtYXBpLm1ldGVvZnJhbmNlLmZyOjQ0M1wvb2F1dGgyXC90b2tlbiIsInRpZXJJbmZvIjp7IjUwUGVyTWluIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJncmFwaFFMTWF4Q29tcGxleGl0eSI6MCwiZ3JhcGhRTE1heERlcHRoIjowLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOiJzZWMifX0sImtleXR5cGUiOiJQUk9EVUNUSU9OIiwic3Vic2NyaWJlZEFQSXMiOlt7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiQVJPTUUiLCJjb250ZXh0IjoiXC9wdWJsaWNcL2Fyb21lXC8xLjAiLCJwdWJsaXNoZXIiOiJhZG1pbl9tZiIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifV0sImV4cCI6MTc0MDcxOTUzMCwidG9rZW5fdHlwZSI6ImFwaUtleSIsImlhdCI6MTczOTQwNDYzMCwianRpIjoiZmZjMGRiOWEtMzlmNy00OTU1LTk2MDgtNWNiM2M5ZWE1ZmZkIn0=.OtIzWhwQQeT5G1wVaNAUxLBNtvfaE2RGHoquE0T-CTdxtrC8PuQg2YvINNNJYrdo7z-FaAISPIHYM9ty_8MjtyeaVNQhvcvWOUPY_2TwjzJ-fbdtBQoWy1ZSdABH90j4QlJghcvOq4f6CYp69RHFyxZaaYRzKxMQHTbjgbxnuUdVs1VwYxi5kKHeNcd6W73_5ygNZoXKRwnj_Xt6o-nmLeoOOOGSlVcIHymXTX9ohaDlpHNJjONm5rrBwz0otqD9AsmlWJRPS5meE0c3U7fvEL2u5iF65E4m9TPWtE-v7UXY21cpGzoK_shiYfQKkS_4l8mWwqED824yX0s9jlQGtA==";  // Remplace par ta clé API
  private wmsUrl: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-001-FRANCE-WMS/GetMap";

  constructor(private http: HttpClient) {}

  getWmsLayer(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrl, { headers, params, responseType: 'blob' });
  }
}
