import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface para tipar os dados dos vídeos do YouTube.
 * Baseado na estrutura do JSON retornado pela API.
 */
export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; };
      medium: { url: string; };
      high: { url: string; };
    };
    channelTitle: string;
  };
  durationInSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  // Este é o endpoint que configuramos no firebase.json para chamar a nossa Cloud Function.
  // Em desenvolvimento, o proxy do Angular (proxy.conf.json) deve ser usado para redirecionar
  // esta chamada para o emulador do Firebase ou para a função em produção.
  private videosApiUrl = '/api/getvideos';

  constructor(private http: HttpClient) { }

  /**
   * Busca a lista de vídeos da nossa API backend (Firebase Function).
   * @returns Um Observable com um array de vídeos.
   */
  getVideos(): Observable<YouTubeVideo[]> {
    return this.http.get<YouTubeVideo[]>(this.videosApiUrl);
  }
}
