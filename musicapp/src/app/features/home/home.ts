import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification';

interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html', 
  styleUrl: './home.scss'    
})
export class Home { 
  
  private notificationService = inject(NotificationService);

  // Canciones recomendadas simuladas
  recommendedSongs: Song[] = [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80' },
    { id: 2, title: 'Hotel California', artist: 'Eagles', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f51508?auto=format&fit=crop&w=300&q=80' },
    { id: 3, title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80' },
    { id: 4, title: 'Back In Black', artist: 'AC/DC', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80' },
    { id: 5, title: 'Smells Like Teen Spirit', artist: 'Nirvana', cover: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&w=300&q=80' },
    { id: 6, title: 'Billie Jean', artist: 'Michael Jackson', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80' },
    { id: 7, title: 'Stairway to Heaven', artist: 'Led Zeppelin', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80' },
    { id: 8, title: 'Imagine', artist: 'John Lennon', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=300&q=80' },
    { id: 9, title: 'Like a Rolling Stone', artist: 'Bob Dylan', cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=300&q=80' },
    { id: 10, title: 'Wonderwall', artist: 'Oasis', cover: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80' }
  ];

  userPlaylists: string[] = [
    'Rock Clásico', 
    'Para Entrenar', 
    'Favoritas del mes', 
    'Una playlist con un nombre extremadamente largo para probar los puntos suspensivos'
  ];

  activeMenuSongId: number | null = null;
  menuView: 'main' | 'playlists' = 'main';

  toggleContextMenu(songId: number, event: Event) {
    event.stopPropagation();
    if (this.activeMenuSongId === songId) {
      this.closeMenu();
    } else {
      this.activeMenuSongId = songId;
      this.menuView = 'main'; 
    }
  }

  showPlaylistsMenu(event: Event) {
    event.stopPropagation();
    this.menuView = 'playlists';
  }

  goBackInMenu(event: Event) {
    event.stopPropagation();
    this.menuView = 'main';
  }

  closeMenu() {
    this.activeMenuSongId = null;
    this.menuView = 'main';
  }

  addToPlaylist(playlistName: string, event: Event) {
    event.stopPropagation();
    this.notificationService.show(`Canción guardada en "${playlistName}"`, 'success');
    this.closeMenu();
  }

  playSong(song: Song, event: Event) {
    event.stopPropagation();
    this.notificationService.show(`Reproduciendo: ${song.title}`, 'info');
  }
}