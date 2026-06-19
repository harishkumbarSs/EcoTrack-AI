import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-wrapper" role="status" [attr.aria-label]="message">
      <div class="spinner-ring" aria-hidden="true">
        <div class="spinner-leaf"></div>
        <div class="spinner-leaf"></div>
        <div class="spinner-leaf"></div>
      </div>
      <p class="spinner-text">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      gap: 20px;
    }
    .spinner-ring {
      width: 48px;
      height: 48px;
      position: relative;
      animation: spin 1.2s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner-leaf {
      position: absolute;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: var(--eco-accent, #00e676);
      &:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); opacity: 1; }
      &:nth-child(2) { bottom: 0; left: 0; opacity: 0.5; }
      &:nth-child(3) { bottom: 0; right: 0; opacity: 0.25; }
    }
    .spinner-text {
      color: var(--text-muted, #64748b);
      font-size: 0.875rem;
      font-weight: 500;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
}
