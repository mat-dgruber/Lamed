import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'googleDriveImage',
  standalone: true
})
export class GoogleDriveImagePipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) return '';
    
    // If it's already a direct link or not from Google Drive, return as is
    if (!url.includes('drive.google.com')) {
      return url;
    }

    try {
      let id = '';
      
      // Handle /file/d/ID/...
      const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch && dMatch[1]) {
        id = dMatch[1];
      } 
      // Handle id=ID in query params
      else if (url.includes('id=')) {
        try {
          const urlObj = new URL(url);
          id = urlObj.searchParams.get('id') || '';
        } catch {
          // Fallback regex for id=ID if URL is malformed
          const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (idMatch) id = idMatch[1];
        }
      }
      
      if (id) {
        return `https://drive.google.com/uc?export=view&id=${id}`;
      }
    } catch (e) {
      console.warn('Error parsing Google Drive URL:', e);
    }
    
    return url;
  }
}
