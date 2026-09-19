import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-donation-charts',
  standalone: true,
  imports: [],
  templateUrl: './donation-charts.component.html',
  styleUrl: './donation-charts.component.css'
})
export class DonationChartsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('geralDonationChart') geralDonationChart: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('socialProjectsChart') socialProjectsChart: ElementRef<HTMLCanvasElement> | undefined;

  private geralChart: Chart | undefined;
  private socialChart: Chart | undefined;
  private observer: IntersectionObserver | undefined;

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    if (this.geralDonationChart) {
      this.observeChart(this.geralDonationChart.nativeElement, 'geral');
    }
    if (this.socialProjectsChart) {
      this.observeChart(this.socialProjectsChart.nativeElement, 'social');
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.geralChart) {
      this.geralChart.destroy();
    }
    if (this.socialChart) {
      this.socialChart.destroy();
    }
  }

  observeChart(canvas: HTMLCanvasElement, chartType: 'geral' | 'social'): void {
    const observerOptions = {
      root: null,
      threshold: 0.3
    };

    const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (chartType === 'geral') {
            this.createGeralChart(canvas);
          } else if (chartType === 'social') {
            this.createSocialChart(canvas);
          }
          observer.unobserve(entry.target);
        }
      });
    };

    this.observer = new IntersectionObserver(observerCallback, observerOptions);
    this.observer.observe(canvas);
  }

  createGeralChart(canvas: HTMLCanvasElement): void {
    if (this.geralChart) {
      this.geralChart.destroy();
    }
    this.geralChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['LAMED (Operação & Conteúdo)', 'Projetos Sociais & Missionários'],
        datasets: [{
          data: [45, 55],
          backgroundColor: ['#F8941B', '#940312'],
          hoverBackgroundColor: ['#e07e0c', '#7d020e'],
          borderColor: '#ffffff',
          borderWidth: 3,
          borderRadius: 6,
          spacing: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          duration: 1400,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'caecilia, sans-serif',
                size: 13,
                weight: 'bold'
              },
              color: '#3f3f46',
              padding: 18,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#2c1e10',
            bodyFont: { family: 'caecilia, sans-serif', size: 13, weight: 'bold' },
            padding: { top: 8, bottom: 8, left: 12, right: 12 },
            cornerRadius: 10,
            displayColors: false,
            caretPadding: 8,
            callbacks: {
              title: () => '',
              label: function(context) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });
  }

  createSocialChart(canvas: HTMLCanvasElement): void {
    if (this.socialChart) {
      this.socialChart.destroy();
    }
    this.socialChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Missão Global', 'Projetos Sociais (ADRA)', 'Dízimo', 'Oferta (IASD)'],
        datasets: [{
          data: [20, 20, 10, 5],
          backgroundColor: ['#F8941B', '#E06A0B', '#940312', '#63020B'],
          hoverBackgroundColor: ['#e07e0c', '#c75806', '#7d020e', '#4c0107'],
          borderColor: '#ffffff',
          borderWidth: 3,
          borderRadius: 5,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          duration: 1600,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'caecilia, sans-serif',
                size: 13,
                weight: 'bold'
              },
              color: '#3f3f46',
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#2c1e10',
            bodyFont: { family: 'caecilia, sans-serif', size: 13, weight: 'bold' },
            padding: { top: 8, bottom: 8, left: 12, right: 12 },
            cornerRadius: 10,
            displayColors: false,
            caretPadding: 8,
            callbacks: {
              title: () => '',
              label: function(context) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });
  }
}
