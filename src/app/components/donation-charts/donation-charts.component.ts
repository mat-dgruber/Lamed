import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-donation-charts',
  standalone: true,
  imports: [],
  templateUrl: './donation-charts.component.html',
  styleUrls: ['./donation-charts.component.css']
})
export class DonationChartsComponent implements AfterViewInit {
  @ViewChild('geralDonationChart') geralDonationChart: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('socialProjectsChart') socialProjectsChart: ElementRef<HTMLCanvasElement> | undefined;

  private geralChart: Chart | undefined;
  private socialChart: Chart | undefined;

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

  observeChart(canvas: HTMLCanvasElement, chartType: 'geral' | 'social'): void {
    const observerOptions = {
      root: null,
      threshold: 0.5
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

    const chartObserver = new IntersectionObserver(observerCallback, observerOptions);
    chartObserver.observe(canvas);
  }

  createGeralChart(canvas: HTMLCanvasElement): void {
    if (this.geralChart) {
      this.geralChart.destroy();
    }
    this.geralChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['LAMED (Operacional, Novos Projetos)', 'Projetos Sociais e Missionários'],
        datasets: [{
          label: 'Distribuição Geral',
          data: [45, 55],
          backgroundColor: ['rgb(248, 149, 27)', 'rgb(148, 3, 17)'],
          borderColor: ['rgba(248, 148, 27, 1)', 'rgba(148, 3, 18, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1.5,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label || ''}: ${context.parsed || 0}%`;
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
      type: 'pie',
      data: {
        labels: ['Missão Global', 'Projetos Sociais (ADRA)', 'Dízimo', 'Oferta (IASD)'],
        datasets: [{
          label: 'Distribuição em Projetos Sociais e Missionários',
          data: [20, 20, 10, 5],
          backgroundColor: ['rgba(250, 184, 31, 1)', 'rgb(250, 119, 31)', 'rgb(148, 3, 17)', 'rgb(92, 36, 3)'],
          borderColor: ['rgba(250, 184, 31, 1)', 'rgb(250, 119, 31)', 'rgba(148, 3, 17)', 'rgb(92, 36, 3)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1.5,
        animation: {
          duration: 4000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label || ''}: ${context.parsed || 0}% (de 55%)`;
              }
            }
          }
        }
      }
    });
  }
}
