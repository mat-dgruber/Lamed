import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Link } from 'lucide-angular';
import { BundleService, Bundle, Resource } from '../../services/bundle.service';

@Component({
  selector: 'app-bundle-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './bundle-editor.component.html',
  styleUrl: './bundle-editor.component.scss'
})
export class BundleEditorComponent {
  private bundleService = inject(BundleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  isSaving = signal(false);
  
  // Model state
  model: Omit<Bundle, 'created_at' | 'updated_at'> = {
    id: '',
    title: '',
    week_number: 1,
    author: 'Lamed',
    description: '',
    resources: [],
    is_active: false,
    article_url: '',
    article_content: '',
    video_id: '',
    thumbnail_url: ''
  };
  
  videoUrl = '';

  newResource: Resource = {
    title: '',
    type: 'pdf',
    url: ''
  };

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.bundleService.getBundleById(id).subscribe(data => {
            this.model = { ...data };
            // Ensure resources is array
            if (!this.model.resources) this.model.resources = [];
            
            if (data.video_id) {
                this.videoUrl = `https://www.youtube.com/watch?v=${data.video_id}`;
            }
        });
      }
    });
  }

  addResource() {
    if (this.newResource.title && this.newResource.url) {
      if (!this.model.resources) this.model.resources = [];
      this.model.resources.push({ ...this.newResource });
      // Reset form
      this.newResource = { title: '', type: 'pdf', url: '' };
    } else {
      alert('Preencha título e URL para adicionar.');
    }
  }

  removeResource(index: number) {
    this.model.resources.splice(index, 1);
  }


  save() {
    this.isSaving.set(true);
    
    // Map video url back to id
    if (this.videoUrl) {
        const videoId = this.extractYoutubeId(this.videoUrl);
        if (videoId) {
            this.model.video_id = videoId;
        }
    }

    const { id, ...bundleData } = this.model;
    const request$ = this.isEditMode()
        ? this.bundleService.updateBundle(id, this.model)
        : this.bundleService.createBundle(bundleData);

    request$.subscribe({
        next: (savedBundle) => {
            console.log('Bundle saved successfully', savedBundle);
            this.isSaving.set(false);
            this.router.navigate(['/admin']);
        },
        error: (err) => {
            console.error('Error saving bundle', err);
            this.isSaving.set(false);
            alert('Erro ao salvar. Verifique o console.');
        }
    });
  }

  private extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
