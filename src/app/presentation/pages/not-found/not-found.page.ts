import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',

  imports: [ButtonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="glass-card content">
        <div class="error-code">404</div>
        <div class="illustration">
          <i class="pi pi-compass"></i>
        </div>
        <h1>Página no encontrada</h1>
        <p class="description">
          Parece que te has perdido en el espacio digital. La página que buscas no existe o ha sido
          movida.
        </p>

        <div class="actions">
          <p-button
            label="Volver al Inicio"
            icon="pi pi-home"
            routerLink="/home"
            styleClass="p-button-primary p-button-lg"
          ></p-button>

          <p-button
            label="Regresar"
            icon="pi pi-arrow-left"
            styleClass="p-button-text p-button-secondary"
            (onClick)="goBack()"
          ></p-button>
        </div>
      </div>

      <div class="decorative-circle circle-1"></div>
      <div class="decorative-circle circle-2"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

      .not-found-container {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: radial-gradient(circle at 50% 50%, #f3f4f6 0%, #e5e7eb 100%);
        padding: 1rem;
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        padding: 4rem 3rem;
        border-radius: 32px;
        text-align: center;
        max-width: 600px;
        width: 100%;
        box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.05),
          0 1px 3px rgba(0, 0, 0, 0.05),
          inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        position: relative;
        z-index: 10;
        animation: floatUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .error-code {
        font-size: 8rem;
        font-weight: 900;
        line-height: 1;
        background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 0.1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1.5);
        z-index: -1;
        user-select: none;
        pointer-events: none;
      }

      .illustration {
        margin-bottom: 2rem;

        i {
          font-size: 5rem;
          color: #1f2937;
          background: rgba(31, 41, 55, 0.05);
          padding: 2rem;
          border-radius: 50%;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
      }

      h1 {
        font-size: 2.5rem;
        color: #111827;
        margin-bottom: 1rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      .description {
        color: #4b5563;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 2.5rem;
        max-width: 80%;
        margin-left: auto;
        margin-right: auto;
      }

      .actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .decorative-circle {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        z-index: 1;
      }

      .circle-1 {
        width: 400px;
        height: 400px;
        background: rgba(31, 41, 55, 0.08); // Gray/Blue
        top: -100px;
        right: -100px;
      }

      .circle-2 {
        width: 300px;
        height: 300px;
        background: rgba(229, 231, 235, 0.5); // Light Gray
        bottom: -50px;
        left: -50px;
      }

      @keyframes floatUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 640px) {
        .glass-card {
          padding: 2.5rem 1.5rem;
        }

        h1 {
          font-size: 2rem;
        }

        .error-code {
          font-size: 5rem;
        }
      }
    `,
  ],
})
export class NotFoundPage {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
