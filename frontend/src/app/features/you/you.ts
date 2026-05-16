import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-you',
  imports: [],
  template: `
    <div class="you-header">
      <h1 class="you-title">You</h1>
    </div>
    <div class="you-body">
      <p class="you-placeholder">Coming soon.</p>
    </div>
  `,
  styles: `
    :host { display: block; }

    .you-header {
      height: var(--header-h);
      padding: 0 var(--gutter);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--paper);
      border-bottom: 1px solid var(--border);
    }

    .you-title {
      font-family: var(--font-display);
      font-size: var(--fs-h3);
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--ink);
      margin: 0;
    }

    .you-body {
      padding: var(--s-7) var(--gutter);
      text-align: center;
    }

    .you-placeholder {
      font-family: var(--font-body);
      font-size: var(--fs-body);
      color: var(--ink-soft);
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class You {}
