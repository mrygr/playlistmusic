import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification';

// Permite mostrar notificaciones en la aplicación. Se suscribe al servicio de notificaciones para mostrar mensajes y permite cerrarlos.

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss']
})
export class NotificationComponent {
  public notificationService = inject(NotificationService);
  public notification$ = this.notificationService.notification$;

  close() {
    this.notificationService.close();
  }
}