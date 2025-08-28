import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BenchmarkService } from './benchmark.service';
import { JsonImportService } from 'src/app/core/json-import.service';
import { CoreService } from 'src/app/core/core.service';

@Component({
  selector: 'app-benchmark-dialog',
  templateUrl: './benchmark-dialog.component.html',
  styleUrls: ['./benchmark-dialog.component.css'],
})
export class BenchmarkDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isRunningBenchmark = false;
  isAggregating = false;
  isProcessingFile = false;
  currentOperation = '';

  // State properties for completion
  isCompleted = false;
  completionMessage = '';
  reportUrl = '';
  completionType: 'success' | 'aggregate' = 'success';

  constructor(
    private dialogRef: MatDialogRef<BenchmarkDialogComponent>,
    private benchmarkService: BenchmarkService,
    private jsonImportService: JsonImportService,
    private coreService: CoreService
  ) {}

  runBenchmark(useImported: boolean) {
    this.isRunningBenchmark = true;
    this.currentOperation = useImported
      ? 'Running benchmark with imported data...'
      : 'Running benchmark with database data...';

    this.benchmarkService.runBenchmark(useImported).subscribe({
      next: (url) => {
        this.isRunningBenchmark = false;
        // Set completion state
        this.showCompletionState(
          'Benchmark analysis completed successfully!',
          url,
          'success'
        );
      },
      error: (err) => {
        this.isRunningBenchmark = false;
        console.error('Benchmark failed', err);
        this.coreService.openSnackBar(
          'Benchmark execution failed. Please try again.'
        );
      },
    });
  }

  runAggregateBenchmark() {
    this.isAggregating = true;
    this.currentOperation = 'Running aggregate benchmark analysis...';

    this.benchmarkService.aggregateBenchmark().subscribe({
      next: () => {
        this.isAggregating = false;
          this.showCompletionState(
            'Aggregate benchmark analysis completed successfully!',
            '',
            'aggregate'
          );

      },
      error: (err) => {
        this.isAggregating = false;
        console.error('Aggregate benchmark failed', err);
        this.coreService.openSnackBar(
          'Aggregate benchmark failed. Please try again.'
        );
      },
    });
  }

  triggerFileSelect() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.coreService.openSnackBar('Please select a valid JSON file.');
      return;
    }

    this.isProcessingFile = true;
    this.currentOperation = 'Processing and validating uploaded file...';

    this.jsonImportService.validateJsonFile(file).subscribe({
      next: (result) => {
        if (result.isValid && result.data) {
          this.isProcessingFile = false;
          this.isRunningBenchmark = true;
          this.currentOperation = 'Running benchmark with uploaded file...';

          this.benchmarkService.runBenchmark(true).subscribe({
            next: (reportUrl) => {
              this.isRunningBenchmark = false;
              // Show completion state
              this.showCompletionState(
                'Benchmark completed successfully with uploaded file!',
                reportUrl,
                'success'
              );
            },
            error: (err) => {
              this.isRunningBenchmark = false;
              console.error('Benchmark failed', err);
              this.coreService.openSnackBar(
                'Benchmark failed with uploaded file'
              );
            },
          });
        } else {
          this.isProcessingFile = false;
          this.coreService.openSnackBar('Invalid JSON file format');
        }
      },
      error: (err) => {
        this.isProcessingFile = false;
        console.error('Error validating file:', err);
        this.coreService.openSnackBar('Error reading JSON file');
      },
    });

    target.value = '';
  }

  // Handle completion state
  private showCompletionState(
    message: string,
    url: string,
    type: 'success' | 'aggregate'
  ) {
    this.isCompleted = true;
    this.completionMessage = message;
    this.reportUrl = url;
    this.completionType = type;
  }

  // Open report in new tab
  openReport() {
    if (this.reportUrl) {
      window.open(this.reportUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // Restart the process
  runAnother() {
    this.isCompleted = false;
    this.completionMessage = '';
    this.reportUrl = '';
  }

  get isLoading(): boolean {
    return (
      this.isRunningBenchmark || this.isAggregating || this.isProcessingFile
    );
  }

  close() {
    if (this.isLoading) {
      return; // Prevent closing during operations
    }
    this.dialogRef.close();
  }

  private showUrlFallback(url: string) {
    // Show a dialog or snackbar with clickable link
    this.coreService.openSnackBar(`Report ready! Click to open: ${url}`);
    console.log('Direct URL:', url);
  }
}
