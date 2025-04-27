import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-score-analysis-dialog',
  templateUrl: './score-analysis-dialog.component.html',
  styleUrls: ['./score-analysis-dialog.component.css'],
})
export class ScoreAnalysisDialogComponent implements OnInit {
  constraints: any[] = [];

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
}
