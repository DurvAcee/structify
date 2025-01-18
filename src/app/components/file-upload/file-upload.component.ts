import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService } from '../../services/excel.service';
import { ValidationError } from '../../models/Employee.interface';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
  public showErrorToast: boolean = false;
  public showSuccessToast: boolean = false;
  public isLoading = false;
  public showError = false;
  public uploadedFileName = '';
  public errors: ValidationError[] = [];

  constructor(private excelService: ExcelService) {}

  async onFileSelected(event: Event): Promise<void> {
    this.errors = [];
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement || !inputElement.files?.length) return;

    const file = inputElement.files[0];
    const validExtensions = ['.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (validExtensions.includes(fileExtension)) {
      this.isLoading = true;
      this.showError = false;
      this.errors = [];
      
      try {
        this.excelService.readFile(file).subscribe({
          next: ({ errors }) => {
            this.handleToast('success');
            this.uploadedFileName = file.name;
            this.errors = errors.map((error: any) => ({
              ...error,
              showDetails: false
            }));
          },
          error: (error) => {
            this.handleToast('error');
            console.error('Error reading file:', error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } catch (error) {
        this.handleToast('error');
        console.error('Unexpected error:', error);
        this.isLoading = false;
      }
    } else {
      this.handleToast('error');
      this.showError = true;
      this.uploadedFileName = '';
      inputElement.value = '';
    }
  }

  public handleToast(type: 'error' | 'success'): void {
    if (type === 'error') {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 1500);
    } else {
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, 1500);
    }
  }
}