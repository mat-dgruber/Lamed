import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'googleDriveImage',
  standalone: true
})
export class GoogleDriveImagePipe implements PipeTransform {
  transform(url: string | undefined): string {
    if (!url) return '';
    
    // Check if it's a Google Drive link
    if (url.includes('drive.google.com')) {
      // Extract the ID from various formats
      // Format 1: https://drive.google.com/file/d/ID/view?usp=sharing
      // Format 2: https://drive.google.com/open?id=ID
      // Format 3: https://drive.google.com/uc?id=ID
      
      let id = '';
      if (url.includes('/file/d/')) {
        const parts = url.split('/file/d/');
        if (parts.length > 1) {
          id = parts[1].split('/')[0];
        }
      } else if (url.includes('id=')) {
        const urlParams = new URL(url);
        id = urlParams.searchParams.get('id') || '';
      }
      
      if (id) {
        return `https://drive.google.com/uc?id=${id}`;
      }
    }
    
    return url;
  }
}
