import { Routes } from '@angular/router';
import { PolkadotTrackerComponent } from './components/polkadot-tracker/polkadot-tracker.component';

export const routes: Routes = [
  {
    path: '',
    component: PolkadotTrackerComponent,
    data: {
      seo: {
        title: {
          es: 'Rastreador de Criptomonedas - Precios e indicadores en tiempo real',
          en: 'Crypto Tracker - Real-time prices and indicators'
        },
        description: {
          es: 'Sigue los precios en tiempo real y los indicadores técnicos de las principales criptomonedas. Toma decisiones de inversión informadas con nuestras herramientas de análisis avanzado.',
          en: 'Track real-time prices and technical indicators for major cryptocurrencies. Make informed investment decisions with our advanced analysis tools.'
        }
      }
    }
  }
];
