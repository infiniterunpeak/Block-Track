import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, ChartDataset, registerables } from 'chart.js';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-polkadot-tracker',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, TranslateModule],
  templateUrl: './polkadot-tracker.component.html',
  styleUrls: ['./polkadot-tracker.component.css']
})
export class PolkadotTrackerComponent implements OnInit, OnDestroy {
  public priceChartData: ChartConfiguration['data'] | undefined;
  public rsiChartData: ChartConfiguration['data'] | undefined;
  public macdChartData: ChartConfiguration['data'] | undefined;
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };
  public chartType: ChartType = 'line';
  public investmentDecision = '';
  public selectedCrypto: string = 'polkadot';
  public cryptos: { id: string, name: string }[] = [];

  public investmentAmount: number | null = null;
  public calculationResult = '';
  public optimalPrice = '';
  public currentCryptoPrice = 0;

  public indicatorSummary: { name: string, value: string, interpretation: string }[] = [];
  public dynamicAnalysisText = '';
  public showLegend = false;

  private currentPrice = 0;
  private currentRSI = 0;
  private currentSMA20 = 0;
  private updateInterval: any;
  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService, private translate: TranslateService) {
    const browserLang = translate.getBrowserLang();
    translate.setDefaultLang('en');
    translate.use(browserLang && browserLang.match(/en|es/) ? browserLang : 'en');
  }

  ngOnInit(): void {
    this.dataService.getTrendingCryptos().pipe(takeUntil(this.destroy$)).subscribe(response => {
      this.cryptos = response.coins.map((coin: any) => ({ id: coin.item.id, name: coin.item.name }));
      this.loadCryptoData(this.selectedCrypto);
      this.startAutoUpdate();
    });
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCryptoChange(): void {
    this.loadCryptoData(this.selectedCrypto);
    this.resetCalculator();
  }

  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.updateInterval = setInterval(() => {
      this.loadCryptoData(this.selectedCrypto);
    }, 20000);
  }

  private resetCalculator(): void {
    this.investmentAmount = null;
    this.calculationResult = '';
    this.optimalPrice = '';
  }

  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }

  calculateInvestment(): void {
    if (this.investmentAmount === null || this.investmentAmount <= 0) {
      this.translate.get('ENTER_VALID_AMOUNT').subscribe((res: string) => {
        this.calculationResult = res;
      });
      this.optimalPrice = '';
      return;
    }

    if (this.currentRSI < 30 && this.currentPrice < this.currentSMA20) {
      this.translate.get('GOOD_DAY_TO_INVEST').subscribe((res: string) => {
        this.calculationResult = `${res} ${this.investmentAmount} USD!`;
      });
      this.translate.get('OPTIMAL_PRICE').subscribe((res: string) => {
        this.optimalPrice = `${res}: ${this.currentPrice.toFixed(4)}`;
      });
    } else {
      this.translate.get('NOT_OPTIMAL_TIME').subscribe((res: string) => {
        this.calculationResult = res;
      });
      this.translate.get('NO_OPTIMAL_PRICE').subscribe((res: string) => {
        this.optimalPrice = `${res} ${this.translate.instant('CURRENT_PRICE')}: ${this.currentPrice.toFixed(4)}`;
      });
    }
  }

  private loadCryptoData(cryptoId: string): void {
    this.dataService.getCryptoData(cryptoId).pipe(takeUntil(this.destroy$)).subscribe(data => {
      const prices = data.prices.map((p: any) => p[1]);
      const dates = data.prices.map((p: any) => new Date(p[0]).toLocaleDateString());

      this.currentPrice = prices[prices.length - 1];
      this.currentCryptoPrice = this.currentPrice;
      const rsi = this.dataService.calculateRSI(prices);
      this.currentRSI = rsi[rsi.length - 1];
      const sma20 = this.dataService.calculateSMA(prices, 20);
      this.currentSMA20 = sma20[sma20.length - 1];

      const sma50 = this.dataService.calculateSMA(prices, 50);
      const macd = this.dataService.calculateMACD(prices);
      const currentSMA50 = sma50[sma50.length - 1];
      const currentMACDLine = macd.macdLine[macd.macdLine.length - 1];
      const currentSignalLine = macd.signalLine[macd.signalLine.length - 1];

      this.indicatorSummary = [
        { name: 'RSI (14)', value: this.currentRSI.toFixed(2), interpretation: this.currentRSI < 30 ? this.translate.instant('OVERSOLD') : (this.currentRSI > 70 ? this.translate.instant('OVERBOUGHT') : this.translate.instant('NEUTRAL')) },
        { name: 'SMA (20)', value: this.currentSMA20.toFixed(2), interpretation: this.currentPrice > this.currentSMA20 ? this.translate.instant('BULLISH') : this.translate.instant('BEARISH') },
        { name: 'SMA (50)', value: currentSMA50.toFixed(2), interpretation: this.currentPrice > currentSMA50 ? this.translate.instant('BULLISH') : this.translate.instant('BEARISH') },
        { name: 'MACD Line', value: currentMACDLine.toFixed(4), interpretation: '' },
        { name: 'Signal Line', value: currentSignalLine.toFixed(4), interpretation: '' }
      ];

      let analysisParts: string[] = [];
      analysisParts.push(this.translate.instant('ANALYSIS_FOR', { crypto: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1) }));

      if (this.currentRSI < 30) {
        analysisParts.push(this.translate.instant('RSI_OVERSOLD_TEXT', { rsi: this.currentRSI.toFixed(2) }));
      } else if (this.currentRSI > 70) {
        analysisParts.push(this.translate.instant('RSI_OVERBOUGHT_TEXT', { rsi: this.currentRSI.toFixed(2) }));
      }

      if (this.currentPrice > this.currentSMA20 && this.currentPrice > currentSMA50) {
        analysisParts.push(this.translate.instant('PRICE_ABOVE_SMAS_TEXT', { sma20: this.currentSMA20.toFixed(2), sma50: currentSMA50.toFixed(2) }));
      } else if (this.currentPrice < this.currentSMA20 && this.currentPrice < currentSMA50) {
        analysisParts.push(this.translate.instant('PRICE_BELOW_SMAS_TEXT', { sma20: this.currentSMA20.toFixed(2), sma50: currentSMA50.toFixed(2) }));
      }

      if (currentMACDLine > currentSignalLine) {
        analysisParts.push(this.translate.instant('MACD_BULLISH_TEXT', { macd: currentMACDLine.toFixed(4), signal: currentSignalLine.toFixed(4) }));
      } else if (currentMACDLine < currentSignalLine) {
        analysisParts.push(this.translate.instant('MACD_BEARISH_TEXT', { macd: currentMACDLine.toFixed(4), signal: currentSignalLine.toFixed(4) }));
      }
      this.dynamicAnalysisText = analysisParts.join(' ');

      this.rsiChartData = {
        labels: dates.slice(14),
        datasets: [{ data: rsi, label: this.translate.instant('14_DAY_RSI'), borderColor: '#ffc107', fill: false }]
      };

      const priceDatasets: ChartDataset[] = [
        { data: prices, label: this.translate.instant('PRICE_HISTORY_LABEL', { crypto: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1) }), borderColor: '#007bff', fill: false },
        { data: sma20, label: this.translate.instant('SMA_20'), borderColor: '#28a745', fill: false },
        { data: sma50, label: this.translate.instant('SMA_50'), borderColor: '#dc3545', fill: false }
      ];
      this.priceChartData = {
        labels: dates,
        datasets: priceDatasets
      };

      this.macdChartData = {
        labels: dates.slice(macd.macdLine.length > 0 ? prices.length - macd.macdLine.length : 0),
        datasets: [
          { data: macd.macdLine, label: this.translate.instant('MACD_LINE'), borderColor: '#6f42c1', fill: false },
          { data: macd.signalLine, label: this.translate.instant('SIGNAL_LINE'), borderColor: '#fd7e14', fill: false },
          {
            data: macd.histogram,
            label: this.translate.instant('HISTOGRAM'),
            type: 'bar',
            backgroundColor: macd.histogram.map(val => val >= 0 ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.6)')
          }
        ]
      };

      if (this.currentRSI < 30) {
        this.translate.get('GOOD_DAY_TO_INVEST_OVERALL').subscribe((res: string) => {
          this.investmentDecision = res;
        });
      } else {
        this.translate.get('TIME_TO_WAIT_OVERALL').subscribe((res: string) => {
          this.investmentDecision = res;
        });
      }
    });
  }

  trackByCrypto(index: number, crypto: { id: string, name: string }): string {
    return crypto.id;
  }

  trackByIndicator(index: number, indicator: { name: string, value: string, interpretation: string }): string {
    return indicator.name;
  }
}
