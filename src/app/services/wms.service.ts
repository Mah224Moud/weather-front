import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WmsService {
  private apiKey: string = "eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJmZTg3NDM4OEBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6ImZlODc0Mzg4IiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJEZWZhdWx0QXBwbGljYXRpb24iLCJpZCI6MjQ3MTYsInV1aWQiOiIwZTgyZmQ0Ni02ZDQ5LTQ4ZmQtODVkNC0zZDc1MWZmZTExYjkifSwiaXNzIjoiaHR0cHM6XC9cL3BvcnRhaWwtYXBpLm1ldGVvZnJhbmNlLmZyOjQ0M1wvb2F1dGgyXC90b2tlbiIsInRpZXJJbmZvIjp7IjUwUGVyTWluIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJncmFwaFFMTWF4Q29tcGxleGl0eSI6MCwiZ3JhcGhRTE1heERlcHRoIjowLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOiJzZWMifX0sImtleXR5cGUiOiJQUk9EVUNUSU9OIiwic3Vic2NyaWJlZEFQSXMiOlt7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiQVJPTUUiLCJjb250ZXh0IjoiXC9wdWJsaWNcL2Fyb21lXC8xLjAiLCJwdWJsaXNoZXIiOiJhZG1pbl9tZiIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiQVJPTUUtUEkiLCJjb250ZXh0IjoiXC9wdWJsaWNcL2Fyb21lcGlcLzEuMCIsInB1Ymxpc2hlciI6ImFkbWluX21mIiwidmVyc2lvbiI6IjEuMCIsInN1YnNjcmlwdGlvblRpZXIiOiI1MFBlck1pbiJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJBUlBFR0UiLCJjb250ZXh0IjoiXC9wdWJsaWNcL2FycGVnZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW5fbWYiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn1dLCJleHAiOjE4MzU3NjQ1MTksInRva2VuX3R5cGUiOiJhcGlLZXkiLCJpYXQiOjE3NDEwOTE3MTksImp0aSI6IjU3MGMwZDMzLTFiNjgtNGYwNS1hNDQ3LWYzZWYxYWEwM2VkYyJ9.dAy3GwIApZf4EI7XDHRB6dvqJifjVQaeHtCQAITeOW8uM7myFBd2ApdRIUaj8bCoMG0JxyrP5WmnPDVCecSwGG5ugGeerdQx3RE3W2t4DL6_A9ugj0lTV2cKAvmEwIjxj-AfB8UBSsbd6QiUE9HVXBcsoVU82MWj7Oy53-Fp-ApCW6Ftodblm7w9S9K-W9mlbYZCQ-QQt5pDEvplXwP-lAWRnGNESuQIhRRt5nz09Jv1Gj53IyndadAnDoizPDyqZqZKdeYNZIRG5JhuuUnX4rizl5qPFSzJ_nNtDLVdztqIuFc9eRK9XMbD9OmmmYNCRv51Ckf2355_C0wLNhkP-A==";  // Remplace par ta clé API
  private wmsUrl: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-001-FRANCE-WMS/GetMap";
  private wmsUrlNCALED: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-OM-0025-NCALED-WMS/GetMap";
  private wmsUrlINDIEN: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-OM-0025-INDIEN-WMS/GetMap";
  private wmsUrlGUYANE: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-OM-0025-GUYANE-WMS/GetMap";
  private wmsUrlANTIL: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-OM-0025-ANTIL-WMS/GetMap";
  private wmsUrlPOLYN: string = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-OM-0025-POLYN-WMS/GetMap";

  constructor(private http: HttpClient) {}

  /**
   * Send a GET request to the WMS API to retrieve a layer of data.
   * @param params The parameters to send with the request. See the WMS API
   * documentation for the available parameters.
   * @returns The response as a blob.
   */
  getWmsLayer(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrl, { headers, params, responseType: 'blob' });
  }


  /**
   * Retrieves the WMS layer for the Nouvelle-Cal donie region using the provided parameters.
   * @param params The parameters to pass to the WMS service.
   * @returns An Observable that emits the WMS layer as a blob.
   */
  getWmsLayerNCALED(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrlNCALED, { headers, params, responseType: 'blob' });
  }

  
  /**
   * Retrieves the WMS layer for the Indien region using the provided parameters.
   * Sends an HTTP GET request to the WMS service URL specific to Indien.
   * 
   * @param params - The parameters to be sent with the WMS request.
   * @returns An Observable that emits the blob response containing the WMS layer image.
   */
  getWmsLayerINDIEN(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrlINDIEN, { headers, params, responseType: 'blob' });
  }

  /**
   * Retrieves the WMS layer for the Guyane region using the provided parameters.
   * Sends an HTTP GET request to the WMS service URL specific to Guyane.
   * 
   * @param params - The parameters to be sent with the WMS request.
   * @returns An Observable that emits the blob response containing the WMS layer image.
   */

  getWmsLayerGUYANE(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrlGUYANE, { headers, params, responseType: 'blob' });
  }

/**
 * Retrieves the WMS layer for the Antilles region using the provided parameters.
 * Sends an HTTP GET request to the WMS service URL specific to Antilles.
 * 
 * @param params - The parameters to be sent with the WMS request.
 * @returns An Observable that emits the blob response containing the WMS layer image.
 */
  getWmsLayerANTIL(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrlANTIL, { headers, params, responseType: 'blob' });
  }

  /**
   * Retrieves the WMS layer for the Polynsie region using the provided parameters.
   * Sends an HTTP GET request to the WMS service URL specific to Polynsie.
   * 
   * @param params - The parameters to be sent with the WMS request.
   * @returns An Observable that emits the blob response containing the WMS layer image.
   */
  getWmsLayerPOLYN(params: any) {
    const headers = new HttpHeaders({
      'accept': 'image/png',
      'apikey': this.apiKey
    });

    return this.http.get(this.wmsUrlPOLYN, { headers, params, responseType: 'blob' });
  }


}
