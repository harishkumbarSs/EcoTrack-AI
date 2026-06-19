import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state" role="region" [attr.aria-label]="title">
      <div class="empty-icon" aria-hidden="true">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <button
        *ngIf="actionLabel && actionRoute"
        mat-raised-button
        color="accent"
        (click)="navigate()"
        class="empty-action"
        [attr.aria-label]="actionLabel"
      >
        <mat-icon aria-hidden="true">add</mat-icon>
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      background: var(--bg-card);
      border: 1px dashed var(--border-color-strong);
      border-radius: var(--radius-lg);
      margin: 16px 0;
    }
    .empty-icon {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: rgba(0, 230, 118, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--eco-accent); }
    }
    .empty-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 8px; }
    .empty-message { color: var(--text-muted); font-size: 0.9rem; max-width: 320px; margin-bottom: 24px; }
    .empty-action { border-radius: var(--radius-md) !important; gap: 6px; }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'eco';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Get started by taking an action.';
  @Input() actionLabel = '';
  @Input() actionRoute = '';

  constructor(private router: Router) {}

  navigate(): void {
    if (this.actionRoute) this.router.navigate([this.actionRoute]);
  }
}
