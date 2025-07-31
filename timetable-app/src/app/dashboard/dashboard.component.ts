import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../login/login.service';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { JsonImportService, ValidationResult } from '../core/json-import.service';
import { CoreService } from '../core/core.service';
import { ExcelImportService, ExcelValidationResult } from '../core/excel-import.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: User = {};
  connectedUser: User = {};
  error: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isImporting = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private jsonImportService: JsonImportService,
    private excelImportService: ExcelImportService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loginService.setShowSidebar(false);
    if (Object.keys(this.user).length == 0) {
      this.loginService.getUserDetails().subscribe({
        next: (userData) => {
          this.user = {
            email: userData.email,
            role: userData.role,
          };
          // Update the service cache
          this.loginService.setUser({ ...this.user });
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.error =
            'Failed to load user information. Please try refreshing the page.';
        },
      });
    }
    this.user = { ...this.loginService.userConnected };
  }

  isAdmin(user: User): boolean {
    return user.role === 'ADMIN';
  }

  // Utility method to get user role display
  getUserRoleDisplay(): string {
    return this.user?.role || 'User';
  }

  // Method to get greeting based on time of day
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  startTimetableGenerationProcess() {
    this.loginService.setShowSidebar(true);
    this.router.navigate(['/rooms']);
  }

  viewTimetableGenerationProcess() {
    this.loginService.setShowSidebar(true);
    this.router.navigate(['/timetable']);
  }

  importFile() {
    this.fileInput.nativeElement.click();
  }

  // Handle file selection and validation
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const isJsonFile = fileName.endsWith('.json');
    const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isJsonFile && !isExcelFile) {
      this.coreService.openSnackBar(
        'Please select a JSON (.json) or Excel (.xlsx/.xls) file'
      );
      return;
    }

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.coreService.openSnackBar(
        'File size too large. Maximum 10MB allowed.'
      );
      return;
    }

    this.isImporting = true;
    const fileType = isJsonFile ? 'JSON' : 'Excel';
    this.coreService.openSnackBar(`Validating ${fileType} file...`);

    if (isJsonFile) {
      this.processJsonFile(file);
    } else {
      this.processExcelFile(file);
    }

    // Reset file input
    target.value = '';
  }

  private processJsonFile(file: File) {
    this.jsonImportService.validateJsonFile(file).subscribe({
      next: (result: ValidationResult) => {
        if (result.isValid && result.data) {
          this.storeAndRedirect(result.data, 'JSON');
        } else {
          this.handleValidationError(result.errors, 'JSON');
        }
      },
      error: (error) => {
        this.handleImportError(error, 'JSON');
      },
    });
  }

  private processExcelFile(file: File) {
    this.excelImportService.validateExcelFile(file).subscribe({
      next: (result: ExcelValidationResult) => {
        if (result.isValid && result.data) {
          // Show warnings if any
          if (result.warnings && result.warnings.length > 0) {
            console.warn('Excel import warnings:', result.warnings);
            // Optionally show warnings to user
            result.warnings.forEach((warning) => {
              console.warn(warning);
            });
          }
          this.storeAndRedirect(result.data, 'Excel');
        } else {
          this.handleValidationError(result.errors, 'Excel');
        }
      },
      error: (error) => {
        this.handleImportError(error, 'Excel');
      },
    });
  }

  private storeAndRedirect(data: any, fileType: string) {
    // Use Excel service for storage (both services use the same IndexedDB)
    this.excelImportService.storeImportedData(data).subscribe({
      next: () => {
        this.isImporting = false;
        this.coreService.openSnackBar(
          `${fileType} file imported successfully!`
        );

        // Redirect to confirmation page
        this.loginService.setShowSidebar(true);
        this.router.navigate(['/confirmation'], {
          queryParams: {
            importMode: 'true',
            importType: fileType.toLowerCase(),
          },
        });
      },
      error: (error) => {
        this.isImporting = false;
        console.error('Error storing data:', error);
        this.coreService.openSnackBar('Failed to store imported data');
      },
    });
  }

  private handleValidationError(errors: string[], fileType: string) {
    this.isImporting = false;
    const errorMessage =
      errors.length > 3
        ? `${errors.slice(0, 3).join(', ')}... (${
            errors.length - 3
          } more errors)`
        : errors.join(', ');
    this.coreService.openSnackBar(
      `Invalid ${fileType} structure: ${errorMessage}`
    );
    console.error(`${fileType} validation errors:`, errors);
  }

  private handleImportError(error: any, fileType: string) {
    this.isImporting = false;
    console.error(`Error processing ${fileType} file:`, error);
    this.coreService.openSnackBar(`Error reading ${fileType} file`);
  }
}
