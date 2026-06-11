import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Define la interfaz AppNotification para representar la estructura de una notificación en la aplicación.
// La interfaz incluye un mensaje, un tipo (success, error, info) y un indicador de visibilidad (show).
// La clase NotificationService es un servicio de Angular que maneja el estado de las notificaciones en la aplicación.
// Utiliza BehaviorSubject para mantener el estado actual de la notificación y permitir que los componentes se suscriban a los cambios.
// El método show() actualiza el estado de la notificación y establece un temporizador para cerrarla automáticamente después de 5 segundos.
// El método close() actualiza el estado para ocultar la notificación.

export interface AppNotification {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationState = new BehaviorSubject<AppNotification>({ message: '', type: 'info', show: false });
  public notification$ = this.notificationState.asObservable();
  private timeoutId: any;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.notificationState.next({ message, type, show: true });
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.close();
    }, 5000);
  }

  close() {
    const current = this.notificationState.value;
    this.notificationState.next({ ...current, show: false });
  }
}