import { Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  template: `
    @switch (variant()) {
      @case ('table') {
        <div class="invoiz-card p-6">
          @for (row of rows(); track $index) {
            <div class="flex items-center gap-4 py-3" [class.border-b]="$index < rows().length - 1" style="border-color: var(--card-border)">
              <p-skeleton width="40px" height="40px" shape="circle" />
              <div class="flex-1">
                <p-skeleton width="60%" height="14px" styleClass="mb-2" />
                <p-skeleton width="40%" height="12px" />
              </div>
              <p-skeleton width="80px" height="24px" borderRadius="9999px" />
              <p-skeleton width="60px" height="14px" />
            </div>
          }
        </div>
      }
      @case ('cards') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (card of [1,2,3,4]; track card) {
            <div class="invoiz-card p-5">
              <p-skeleton width="50%" height="12px" styleClass="mb-3" />
              <p-skeleton width="70%" height="28px" styleClass="mb-2" />
              <p-skeleton width="30%" height="12px" />
            </div>
          }
        </div>
      }
      @case ('form') {
        <div class="invoiz-card p-6 space-y-4">
          @for (field of rows(); track $index) {
            <div>
              <p-skeleton width="120px" height="12px" styleClass="mb-2" />
              <p-skeleton width="100%" height="40px" />
            </div>
          }
        </div>
      }
      @default {
        <div class="invoiz-card p-6">
          <p-skeleton width="100%" [height]="height()" />
        </div>
      }
    }
  `,
})
export class LoadingSkeletonComponent {
  variant = input<'table' | 'cards' | 'form' | 'block'>('table');
  rows = input<number[]>([1, 2, 3, 4, 5]);
  height = input<string>('200px');
}
