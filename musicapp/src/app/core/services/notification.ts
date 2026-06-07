import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
    }, 3500);
  }

  close() {
    const current = this.notificationState.value;
    this.notificationState.next({ ...current, show: false });
  }
}