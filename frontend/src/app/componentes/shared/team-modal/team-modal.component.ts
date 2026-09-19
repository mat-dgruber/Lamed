import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal
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
  readonly isClosing = signal(false);
  hasImageError = false;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    if (this.isClosing()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.closed.emit();
    }, 250);
  }

  onImageError(): void {
    this.hasImageError = true;
  }
}
