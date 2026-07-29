import { Pipe, PipeTransform } from '@angular/core';

export function convertGoogleDriveUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's already a direct lh3 link or not from Google Drive, return as is
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }

  if (!url.includes('drive.google.com')) {
    return url;
  }

  try {
    let id = '';
    
    // Handle /file/d/ID/... or /d/ID
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) {
      id = dMatch[1];
    } 
    // Handle id=ID in query params or open?id=ID / uc?id=ID
    else if (url.includes('id=')) {
      try {
        const urlObj = new URL(url);
        id = urlObj.searchParams.get('id') || '';
      } catch {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) id = idMatch[1];
      }
    }
    
    if (id) {
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  } catch (e) {
    console.warn('Error parsing Google Drive URL:', e);
  }
  
  return url;
}

@Pipe({
  name: 'googleDriveImage',
  standalone: true
})
export class GoogleDriveImagePipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    return convertGoogleDriveUrl(url);
  }
}

