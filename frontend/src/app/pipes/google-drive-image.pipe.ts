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
      
      // Format 1: https://drive.google.com/file/d/ID/view...
      if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          id = match[1];
        }
      } 
      // Format 2 & 3: https://drive.google.com/open?id=ID or /uc?id=ID
      else if (url.includes('id=')) {
        const urlObj = new URL(url);
        id = urlObj.searchParams.get('id') || '';
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
