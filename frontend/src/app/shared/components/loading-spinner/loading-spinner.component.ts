import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-16">
      <div [style.width.px]="size" [style.height.px]="size"
           class="rounded-full border-4 border-riad-200 border-t-riad-600 animate-spin">
      </div>
      @if (message) {
        <p class="text-sm text-gray-500">{{ message }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size    = 40;
  @Input() message = '';
}
