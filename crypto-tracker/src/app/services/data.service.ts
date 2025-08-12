import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly COINGECKO_URL = 'https://api.coingecko.com/api/v3';

  constructor(private http: HttpClient) { }

  getCryptoData(cryptoId: string): Observable<any> {
    return this.http.get(`${this.COINGECKO_URL}/coins/${cryptoId}/market_chart?vs_currency=usd&days=90&interval=daily`);
  }

  getTrendingCryptos(): Observable<any> {
    return this.http.get(`${this.COINGECKO_URL}/search/trending`);
  }

  calculateRSI(prices: number[]): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (i <= 14) {
        if (change > 0) {
          gains += change;
        } else {
          losses -= change;
        }
      } else {
        if (change > 0) {
          gains = (gains * 13 + change) / 14;
          losses = (losses * 13) / 14;
        } else {
          gains = (gains * 13) / 14;
          losses = (losses * 13 - change) / 14;
        }
      }

      if (i >= 14) {
        const rs = gains / losses;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    return rsi;
  }

  calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i <= prices.length - period; i++) {
      const sum = prices.slice(i, i + period).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    let multiplier = 2 / (period + 1);
    ema[0] = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
  }

  calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macdLine: number[], signalLine: number[], histogram: number[] } {
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);

    const macdLine: number[] = [];
    for (let i = 0; i < emaFast.length; i++) {
      macdLine.push(emaFast[i] - emaSlow[i]);
    }

    const signalLine = this.calculateEMA(macdLine, signalPeriod);

    const histogram: number[] = [];
    for (let i = 0; i < macdLine.length; i++) {
      histogram.push(macdLine[i] - signalLine[i]);
    }

    return { macdLine, signalLine, histogram };
  }
}
