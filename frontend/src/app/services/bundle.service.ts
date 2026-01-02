import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LessonBundle {
    id: number;
    title: string;
    slug?: string;
    trimester: string;
    lesson_number: number;
    youtube_link?: string;
    article_link?: string;
    file_guide_url?: string;
    file_slides_url?: string;
    file_map_url?: string;
    file_infographic_url?: string;
    file_flashcards_url?: string;
    published_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private apiUrl = '/api/bundles';

  constructor(private http: HttpClient) {}

  getBundles(): Observable<LessonBundle[]> {
    return this.http.get<LessonBundle[]>(this.apiUrl);
  }

  getBundleById(id: number): Observable<LessonBundle> {
      return this.http.get<LessonBundle>(`${this.apiUrl}/${id}`);
  }

  createBundle(formData: FormData): Observable<LessonBundle> {
      return this.http.post<LessonBundle>(this.apiUrl, formData);
  }

  updateBundle(id: number, formData: FormData): Observable<LessonBundle> {
      return this.http.put<LessonBundle>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBundle(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
