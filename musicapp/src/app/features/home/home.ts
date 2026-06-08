import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification';
import { PlaylistService, Song } from '../../core/services/playlist';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html', 
  styleUrl: './home.scss'    
})
export class Home { 
  private notificationService = inject(NotificationService);
  playlistService = inject(PlaylistService);

  // Consumimos las canciones desde la "fuente de verdad" del servicio
  get recommendedSongs(): Song[] {
    return this.playlistService.allSongs.slice(0, 10); // Mostramos solo 5 para recomendar
  }

  playSong(song: Song, event: Event) {
    event.stopPropagation();
    this.notificationService.show(`Reproduciendo: ${song.title}`, 'info');
  }
}