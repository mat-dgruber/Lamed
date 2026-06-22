import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { TeamMember } from '../../sobre/sobre';

@Component({
  selector: 'app-team-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './team-modal.component.html',
  styleUrl: './team-modal.component.scss'
})
export class TeamModalComponent {
  @Input({ required: true }) member!: TeamMember;
  @Output() readonly closed = new EventEmitter<void>();

  readonly icons = { X } as const;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  hasImageError = false;

  onImageError(): void {
    this.hasImageError = true;
  }
}
