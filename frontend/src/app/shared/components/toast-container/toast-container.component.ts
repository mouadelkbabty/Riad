import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-xl
                    text-sm font-medium animate-slide-up border"
             [class]="toastClass(toast)">
          <span class="text-base flex-shrink-0 mt-0.5">{{ toastIcon(toast) }}</span>
          <p class="flex-1">{{ toast.message }}</p>
          <button (click)="toastService.dismiss(toast.id)"
                  class="text-current opacity-50 hover:opacity-100 transition-opacity ml-1">
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  toastClass(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'bg-green-50  text-green-800 border-green-200',
      error:   'bg-red-50    text-red-800   border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      info:    'bg-blue-50   text-blue-800  border-blue-200',
    };
    return map[toast.type] ?? map['info'];
  }

  toastIcon(toast: Toast): string {
    const map: Record<string, string> = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
    };
    return map[toast.type] ?? 'ℹ️';
  }
}
