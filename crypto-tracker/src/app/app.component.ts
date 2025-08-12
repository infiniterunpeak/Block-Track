import { Component, inject } from '@angular/core';
import { PolkadotTrackerComponent } from './components/polkadot-tracker/polkadot-tracker.component';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PolkadotTrackerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'crypto-tracker';
  private seoService = inject(SeoService);

  constructor() {
    this.seoService.init();
  }
}
