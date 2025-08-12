import { Component } from '@angular/core';
import { PolkadotTrackerComponent } from './components/polkadot-tracker/polkadot-tracker.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PolkadotTrackerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'crypto-tracker';
}
