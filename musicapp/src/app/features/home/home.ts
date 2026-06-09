import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification';
import { PlaylistService, Song } from '../../core/services/playlist';
import { PlayerService } from '../../core/services/player'; // <-- 1. Importamos el servicio del reproductor

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html', 
  styleUrl: './home.scss'    
})
export class Home { 
  private notificationService = inject(NotificationService);
  public playlistService = inject(PlaylistService);
  public playerService = inject(PlayerService); // <-- 2. Lo inyectamos para poder usarlo

  // Consumimos las canciones desde la "fuente de verdad" del servicio
  get recommendedSongs(): Song[] {
    return this.playlistService.allSongs.slice(0, 10);
  }

  playSong(song: Song, event: Event) {
    event.stopPropagation();
    
    // 3. ¡LA MAGIA AQUÍ! 
    // Al pasar solo "song" (sin una playlist de segundo parámetro), 
    // el reproductor sabe que debe eliminar la cola anterior y reproducir solo esta.
    this.playerService.playSong(song);
    
    // Mantenemos tu notificación para darle feedback al usuario
    //this.notificationService.show(`Reproduciendo: ${song.title}`, 'success');
  }
}