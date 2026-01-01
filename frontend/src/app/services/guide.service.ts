import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private apiUrl = '/api/guides';

  constructor(private http: HttpClient) {}

  getGuides(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getGuideById(id: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createGuide(guide: any): Observable<any> {
      return this.http.post(this.apiUrl, guide);
  }

  updateGuide(id: number, guide: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, guide);
  }

  deleteGuide(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
