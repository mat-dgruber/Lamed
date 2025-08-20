import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Animation } from 'chart.js';

@Component({
  selector: 'app-donation-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="charts-container">
      <div class="chart-block" #geralChartContainer>
        <h3>Distribuição Geral das Doações</h3>
        <canvas *ngIf="isGeralChartVisible"
                baseChart
                [data]="geralDonationData"
                [type]="'pie'"
                [options]="pieChartOptions">
        </canvas>
      </div>
      <div class="chart-block" #socialChartContainer>
        <h3>Distribuição em Projetos Sociais e Missionários</h3>
        <canvas *ngIf="isSocialChartVisible"
                baseChart
                [data]="socialProjectsData"
                [type]="'pie'"
                [options]="pieChartOptions">
        </canvas>
      </div>
    </div>
  `
})
export class DonationChartsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('geralChartContainer') geralChartContainer!: ElementRef;
  @ViewChild('socialChartContainer') socialChartContainer!: ElementRef;

  isGeralChartVisible = false;
  isSocialChartVisible = false;

  private observer?: IntersectionObserver;

  // --- Configuração do Gráfico Geral ---
  public geralDonationData: ChartData<'pie', number[], string | string[]> = {
    labels: ['LAMED (Operacional, Novos Projetos)', 'Projetos Sociais e Missionários'],
    datasets: [{
      data: [45, 55],
      backgroundColor: ['rgb(248, 149, 27)', 'rgb(148, 3, 17)'],
      borderColor: ['rgba(248, 148, 27, 1)', 'rgba(148, 3, 18, 1)'],
      borderWidth: 1
    }]
  };

  // --- Configuração do Gráfico Social ---
  public socialProjectsData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Missão Global', 'Projetos Sociais (ADRA)', 'Dízimo', 'Oferta (IASD)'],
    datasets: [{
      data: [20, 20, 10, 5],
      backgroundColor: ['rgba(250, 184, 31, 1)', 'rgb(250, 119, 31)', 'rgb(148, 3, 17)', 'rgb(92, 36, 3)'],
      borderColor: ['rgba(250, 184, 31, 1)', 'rgb(250, 119, 31)', 'rgba(148, 3, 17)', 'rgb(92, 36, 3)'],
      borderWidth: 1
    }]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    aspectRatio: 1.5,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label || ''}: ${context.parsed || 0}%`
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  ngAfterViewInit(): void {
    const options = {
      root: null,
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === this.geralChartContainer.nativeElement) {
            this.isGeralChartVisible = true;
          } else if (entry.target === this.socialChartContainer.nativeElement) {
            this.isSocialChartVisible = true;
          }
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.geralChartContainer.nativeElement);
    this.observer.observe(this.socialChartContainer.nativeElement);
  }

  ngOnDestroy(): void {
    // Disconnect the observer when the component is destroyed
    this.observer?.disconnect();
  }
}
