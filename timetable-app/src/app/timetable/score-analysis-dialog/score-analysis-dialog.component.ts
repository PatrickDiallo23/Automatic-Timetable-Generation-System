import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-score-analysis-dialog',
  templateUrl: './score-analysis-dialog.component.html',
  styleUrls: ['./score-analysis-dialog.component.css'],
})
export class ScoreAnalysisDialogComponent implements OnInit {
  constraints: any[] = [];
  isDownloading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    const getScoreComponents = (score: string) => {
      const components = { hard: 0, medium: 0, soft: 0 };
      Array.from(score.matchAll(/(-?[0-9]+)(hard|medium|soft)/g)).forEach(
        (m: any) => {
          components[m[2] as 'hard' | 'medium' | 'soft'] = parseInt(m[1], 10);
        }
      );
      console.log(components);
      return components;
    };

    const constraints = [...this.data.constraints];
    constraints.sort((a, b) => {
      const aC = getScoreComponents(a.score);
      const bC = getScoreComponents(b.score);
      if (aC.hard < 0 && bC.hard > 0) return -1;
      if (aC.hard > 0 && bC.hard < 0) return 1;
      if (Math.abs(aC.hard) !== Math.abs(bC.hard))
        return Math.abs(bC.hard) - Math.abs(aC.hard);
      if (Math.abs(aC.medium) !== Math.abs(bC.medium))
        return Math.abs(bC.medium) - Math.abs(aC.medium);
      return Math.abs(bC.soft) - Math.abs(aC.soft);
    });

    for (const e of constraints) {
      const w = getScoreComponents(e.weight);
      e.type = w.hard !== 0 ? 'hard' : w.medium !== 0 ? 'medium' : 'soft';
      e.weight = w[e.type as 'hard' | 'medium' | 'soft'];

      const s = getScoreComponents(e.score);
      e.implicitScore =
        s.hard !== 0 ? s.hard : s.medium !== 0 ? s.medium : s.soft;
      console.log(e);
    }

    this.constraints = constraints;
  }

  async downloadReportFile(
    data: any,
    filename: string = 'score-analysis'
  ): Promise<void> {
    try {
      this.isDownloading = true;

      // Create TLDR section with table
      const tldrSection = this.generateTLDRTable(data);

      // Create the complete report content
      const reportContent = `${tldrSection}\n\n${'='.repeat(
        80
      )}\nRAW JSON DATA\n${'='.repeat(80)}\n\n${JSON.stringify(data, null, 2)}`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${
        new Date().toISOString().split('T')[0]
      }.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You could show a snackbar or toast notification here
    } finally {
      this.isDownloading = false;
    }
  }

  private generateTLDRTable(constraints: any[]): string {
    const lines: string[] = [];

    // Header
    lines.push('SCORE ANALYSIS REPORT');
    lines.push('='.repeat(80));
    lines.push(`Generated on: ${new Date().toLocaleString()}`);
    lines.push('');

    // Legend
    lines.push('LEGEND:');
    lines.push('  ❗️  - Constraint violated (negatively impacts score)');
    lines.push('  ⭐ - Soft constraint satisfied (improves score)');
    lines.push('  ✅  - Constraint satisfied (no violations found)');
    lines.push('');

    // Summary statistics
    const violatedConstraints = constraints.filter(
      (c) => c.implicitScore < 0 && c.weight < 0
    ).length;
    const satisfiedSoftConstraints = constraints.filter(
      (c) => c.type === 'soft' && c.implicitScore > 0 && c.weight > 0
    ).length;
    const fullyCompliantConstraints = constraints.filter(
      (c) => c.weight < 0 && c.matches?.length === 0
    ).length;

    lines.push('SUMMARY:');
    lines.push(`  Total Constraints: ${constraints.length}`);
    lines.push(`  Violated: ${violatedConstraints}`);
    lines.push(`  Soft Satisfied: ${satisfiedSoftConstraints}`);
    lines.push(`  Fully Compliant: ${fullyCompliantConstraints}`);
    lines.push('');

    // Table header
    lines.push('DETAILED BREAKDOWN:');
    lines.push('-'.repeat(80));

    // Calculate column widths for better formatting
    const maxNameLength = Math.max(
      ...constraints.map((c) => c.name?.length || 0),
      'Constraint'.length
    );
    const nameWidth = Math.min(Math.max(maxNameLength, 15), 40); // Between 15-40 chars

    const headerRow = `${'Icon'.padEnd(4)} | ${'Constraint'.padEnd(
      nameWidth
    )} | ${'Type'.padEnd(6)} | ${'Matches'.padEnd(7)} | ${'Weight'.padEnd(
      8
    )} | ${'Score'.padEnd(8)}`;
    lines.push(headerRow);
    lines.push('-'.repeat(headerRow.length));

    // Table rows
    constraints.forEach((constraint) => {
      const icon = this.getConstraintIcon(constraint);
      const name = (constraint.name || 'N/A')
        .substring(0, nameWidth)
        .padEnd(nameWidth);
      const type = (constraint.type || 'N/A').padEnd(6);
      const matches = (constraint.matches?.length?.toString() || '0').padEnd(7);
      const weight = (constraint.weight?.toString() || '0').padEnd(8);
      const score = (constraint.implicitScore?.toString() || '0').padEnd(8);

      lines.push(
        `${icon.padEnd(
          4
        )} | ${name} | ${type} | ${matches} | ${weight} | ${score}`
      );
    });

    lines.push('-'.repeat(headerRow.length));

    return lines.join('\n');
  }

  private getConstraintIcon(constraint: any): string {
    // Violated constraint
    if (
      (constraint.type === 'hard' ||
        constraint.type === 'medium' ||
        constraint.type === 'soft') &&
      constraint.implicitScore < 0 &&
      constraint.weight < 0
    ) {
      return '❗️';
    }

    // Soft constraint satisfied
    if (
      constraint.type === 'soft' &&
      constraint.implicitScore > 0 &&
      constraint.weight > 0
    ) {
      return '⭐';
    }

    // Constraint satisfied (no violations)
    if (constraint.weight < 0 && constraint.matches?.length === 0) {
      return '✅';
    }

    return ' '; // No icon
  }
}
