import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BenchmarkService } from './benchmark.service';
import { JsonImportService } from 'src/app/core/json-import.service';
import { CoreService } from 'src/app/core/core.service';
import { AggregationResponse, BenchmarkDirectory } from 'src/app/model/timetableEntities';

type ViewState =
  | 'main'
  | 'loading'
  | 'completed'
  | 'selectBenchmarksForAggregation';

@Component({
  selector: 'app-benchmark-dialog',
  templateUrl: './benchmark-dialog.component.html',
  styleUrls: ['./benchmark-dialog.component.css'],
})
export class BenchmarkDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  currentView: ViewState = 'main';
  isRunningBenchmark = false;
  isAggregating = false;
  isProcessingFile = false;
  isLoadingDirectories = false;
  currentOperation = '';

  // Completion state variables
  isCompleted = false;
  completionMessage = '';
  reportUrl = '';
  completionType: 'success' | 'aggregate' = 'success';

  availableDirectories: BenchmarkDirectory[] = [];
  hasSelectedDirectories = false;

  constructor(
    private dialogRef: MatDialogRef<BenchmarkDialogComponent>,
    private benchmarkService: BenchmarkService,
    private jsonImportService: JsonImportService,
    private coreService: CoreService
  ) {}

  runBenchmark(useImported: boolean) {
    this.currentView = 'loading';
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
        this.currentView = 'main';
        console.error('Benchmark failed', err);
        this.coreService.openSnackBar(
          'Benchmark execution failed. Please try again.'
        );
      },
    });
  }

  showSelectiveBenchmarkOptions() {
    this.currentView = 'loading';
    this.isLoadingDirectories = true;
    this.currentOperation = 'Loading available benchmark directories...';

    this.benchmarkService.getAvailableBenchmarkDirectories().subscribe({
      next: (directories) => {
        this.isLoadingDirectories = false;
        this.availableDirectories = directories;
        this.currentView = 'selectBenchmarksForAggregation';
        this.updateSelectedDirectoriesState();
      },
      error: (err) => {
        this.isLoadingDirectories = false;
        this.currentView = 'main';
        console.error('Failed to load benchmark directories', err);
        this.coreService.openSnackBar(
          'Failed to load benchmark directories. Please try again.'
        );
      },
    });
  }

  trackByDirectoryName(index: number, directory: BenchmarkDirectory): string {
    return directory.name;
  }

  // Toggle directory selection
  toggleDirectorySelection(directory: BenchmarkDirectory) {
    directory.selected = !directory.selected;
    this.updateSelectedDirectoriesState();
  }

  // Update selection state
  private updateSelectedDirectoriesState() {
    this.hasSelectedDirectories = this.availableDirectories.some(
      (dir) => dir.selected
    );
  }

  // Select all directories
  isAllSelected(): boolean {
    return (
      this.availableDirectories.length > 0 &&
      this.availableDirectories.every((dir) => dir.selected)
    );
  }

  // Helper method to get count of selected directories
  getSelectedCount(): number {
    return this.availableDirectories.filter((dir) => dir.selected).length;
  }

  // Updated selectAllDirectories method
  selectAllDirectories() {
    const shouldSelectAll = !this.isAllSelected();
    this.availableDirectories.forEach(
      (dir) => (dir.selected = shouldSelectAll)
    );
    this.updateSelectedDirectoriesState();
  }

  runAggregateBenchmark() {
    this.currentView = 'loading';
    this.isAggregating = true;
    this.currentOperation = 'Running aggregate benchmark analysis...';

    this.benchmarkService.aggregateAllBenchmarks().subscribe({
      next: (response: AggregationResponse) => {
        this.isAggregating = false;
        console.log('Aggregate benchmark result:', response);

        // Extract report URL from response and generate accessible URL
        let reportUrl = '';
        if (response.reportPath) {
          reportUrl = response.reportPath;
        }

        this.showCompletionState(
          'Aggregate benchmark analysis completed successfully!',
          reportUrl,
          'aggregate'
        );
      },
      error: (err) => {
        this.isAggregating = false;
        this.currentView = 'main';
        console.error('Aggregate benchmark failed', err);
        this.coreService.openSnackBar(
          'Aggregate benchmark failed. Please try again.'
        );
      },
    });
  }

  runSelectiveAggregation() {
    const selectedDirectoryNames = this.availableDirectories
      .filter((dir) => dir.selected)
      .map((dir) => dir.name);

    if (selectedDirectoryNames.length === 0) {
      this.coreService.openSnackBar(
        'Please select at least one benchmark directory.'
      );
      return;
    }

    this.currentView = 'loading';
    this.isAggregating = true;
    this.currentOperation = `Aggregating ${selectedDirectoryNames.length} selected benchmark(s)...`;

    this.benchmarkService
      .aggregateSelectedBenchmarks(selectedDirectoryNames)
      .subscribe({
        next: (response: AggregationResponse) => {
          this.isAggregating = false;
          console.log('Selective aggregate benchmark result:', response);

          // **MODIFICATION**: Generate report URL for selective aggregation
          let reportUrl = '';
          if (response.reportPath) {
            reportUrl = response.reportPath;
          }

          this.showCompletionState(
            `Selective aggregation completed! Processed ${selectedDirectoryNames.length} benchmark(s).`,
            reportUrl,
            'aggregate'
          );
        },
        error: (err) => {
          this.isAggregating = false;
          this.currentView = 'main';
          console.error('Selective aggregate benchmark failed', err);
          this.coreService.openSnackBar(
            'Selective aggregation failed. Please try again.'
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

    this.currentView = 'loading';
    this.isProcessingFile = true;
    this.currentOperation = 'Processing and validating uploaded file...';

    this.jsonImportService.validateJsonFile(file).subscribe({
      next: (result) => {
        if (result.isValid && result.data) {
          this.jsonImportService.storeImportedData(result.data).subscribe({
            next: () => {
              this.isProcessingFile = false;
              this.isRunningBenchmark = true;
              this.currentOperation = 'Running benchmark with uploaded file...';

              this.benchmarkService.runBenchmark(true).subscribe({
                next: (reportUrl) => {
                  this.isRunningBenchmark = false;
                  this.showCompletionState(
                    'Benchmark completed successfully with uploaded file!',
                    reportUrl,
                    'success'
                  );
                },
                error: (err) => {
                  this.isRunningBenchmark = false;
                  this.currentView = 'main';
                  console.error('Benchmark failed', err);
                  this.coreService.openSnackBar(
                    'Benchmark failed with uploaded file'
                  );
                },
              });
            },
            error: (storeErr) => {
              this.isProcessingFile = false;
              this.currentView = 'main';
              console.error('Error storing imported data:', storeErr);
              this.coreService.openSnackBar('Failed to store imported data');
            }
          });
        } else {
          this.isProcessingFile = false;
          this.currentView = 'main';
          this.coreService.openSnackBar('Invalid JSON file format');
        }
      },
      error: (err) => {
        this.isProcessingFile = false;
        this.currentView = 'main';
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
    this.currentView = 'completed';
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
  goBackToMain() {
    this.currentView = 'main';
    this.availableDirectories = [];
    this.hasSelectedDirectories = false;
  }

  runAnother() {
    this.currentView = 'main';
    this.isCompleted = false;
    this.completionMessage = '';
    this.reportUrl = '';
    this.availableDirectories = [];
    this.hasSelectedDirectories = false;
  }

  get isLoading(): boolean {
    return (
      this.isRunningBenchmark ||
      this.isAggregating ||
      this.isProcessingFile ||
      this.isLoadingDirectories
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
