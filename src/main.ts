import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './app/components/file-upload/file-upload.component';
import { ExcelService } from './app/services/excel.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  templateUrl: './app/app.component.html'
})
export class App {}

bootstrapApplication(App, {
  providers: [ExcelService]
});