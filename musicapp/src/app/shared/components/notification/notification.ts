import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-wrapper" [class.show]="(notification$ | async)?.show">
      
      <div class="toast" [ngClass]="(notification$ | async)?.type">
        <span class="message">{{ (notification$ | async)?.message }}</span>
        
        <button class="close-btn" (click)="close()">&times;</button>
      </div>

    </div>
  `,
  styles: [`
    .notification-wrapper {
      position: fixed;
      top: 30px;
      right: 30px;
      z-index: 9999; /* Para que siempre esté por encima de todo */
      transform: translateX(150%); /* Oculto fuera de la pantalla hacia la derecha */
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .notification-wrapper.show {
      transform: translateX(0);
    }
    
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 280px;
      max-width: 400px;
      padding: 16px 20px;
      border-radius: 8px;
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }
    
    /* Colores según el tipo de notificación */
    .toast.success { background-color: #1db954; } /* Verde Spotify */
    .toast.error { background-color: #e22134; }   /* Rojo Error */
    .toast.info { background-color: #2e77d0; }    /* Azul Info */
    
    .message {
      font-size: 0.95rem;
      font-weight: 600;
      margin-right: 20px;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .close-btn:hover { opacity: 1; }
  `]
})
export class NotificationComponent {
  public notificationService = inject(NotificationService);
  public notification$ = this.notificationService.notification$;

  close() {
    this.notificationService.close();
  }
}
