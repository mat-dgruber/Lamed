import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { Video } from '../../services/video.service';

@Component({
  selector: 'app-admin-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './admin-videos.component.html',
  styles: []
})
export class AdminVideosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  videos = signal<Video[]>([]);
  loading = signal<boolean>(false);
  isSyncing = signal<boolean>(false);
  searchTerm = signal<string>('');
  filterType = signal<'all' | 'video' | 'short'>('all');
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');

  filteredVideos = computed(() => {
    let list = this.videos();
    const search = this.searchTerm().toLowerCase().trim();
    const type = this.filterType();
    const status = this.filterStatus();

    if (search) {
      list = list.filter(
        v => v.title.toLowerCase().includes(search) || (v.description && v.description.toLowerCase().includes(search))
      );
    }

    if (type === 'short') {
      list = list.filter(v => v.is_short === true);
    } else if (type === 'video') {
      list = list.filter(v => !v.is_short);
    }

    if (status === 'active') {
      list = list.filter(v => v.is_active);
    } else if (status === 'inactive') {
      list = list.filter(v => !v.is_active);
    }

    return list;
  });

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.loading.set(true);
    this.http.get<Video[]>(`${this.apiUrl}/admin/videos/`).subscribe({
      next: (data) => {
        this.videos.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading admin videos:', err);
        this.loading.set(false);
      }
    });
  }

  toggleActive(video: Video) {
    const updatedStatus = !video.is_active;
    this.http.patch<Video>(`${this.apiUrl}/admin/videos/${video.id}`, { is_active: updatedStatus }).subscribe({
      next: (updatedVideo) => {
        this.videos.update(list =>
          list.map(v => (v.id === video.id ? { ...v, is_active: updatedVideo.is_active } : v))
        );
      },
      error: (err) => {
        console.error('Error toggling active status:', err);
      }
    });
  }

  toggleShort(video: Video) {
    const updatedShort = !video.is_short;
    this.http.patch<Video>(`${this.apiUrl}/admin/videos/${video.id}`, { is_short: updatedShort }).subscribe({
      next: (updatedVideo) => {
        this.videos.update(list =>
          list.map(v => (v.id === video.id ? { ...v, is_short: updatedVideo.is_short } : v))
        );
      },
      error: (err) => {
        console.error('Error toggling short status:', err);
      }
    });
  }

  syncYoutube() {
    this.isSyncing.set(true);
    this.http.post<{ status: string; data?: any }>(`${this.apiUrl}/admin/sync-youtube`, {}).subscribe({
      next: () => {
        this.isSyncing.set(false);
        this.loadVideos();
      },
      error: (err) => {
        console.error('Error syncing youtube:', err);
        this.isSyncing.set(false);
      }
    });
  }
}
