import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-file-upload-zone',
  standalone: true,
  template: `
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
             hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
      [class.border-[var(--primary)]]="isDragging"
      [class.bg-[var(--primary-light)]]="isDragging"
      style="border-color: var(--card-border)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()">
      <input
        #fileInput
        type="file"
        [accept]="accept()"
        [multiple]="multiple()"
        class="hidden"
        (change)="onFileSelected($event)" />

      <i class="pi pi-cloud-upload text-3xl mb-3" style="color: var(--text-muted)"></i>
      <p class="text-sm font-medium" style="color: var(--text-primary)">
        Drag and drop files here, or <span style="color: var(--primary)" class="font-semibold">browse</span>
      </p>
      <p class="text-xs mt-1" style="color: var(--text-muted)">{{ hint() }}</p>
    </div>
  `,
})
export class FileUploadZoneComponent {
  accept = input<string>('.csv,.xlsx');
  multiple = input<boolean>(false);
  hint = input<string>('Supports CSV and Excel files');

  filesSelected = output<File[]>();

  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length) this.filesSelected.emit(files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length) this.filesSelected.emit(files);
    input.value = '';
  }
}
