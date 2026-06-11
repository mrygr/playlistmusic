import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from '../../core/services/player';
import { PlaylistService, Song } from '../../core/services/playlist';

// Componente del reproductor de música, que muestra la canción actual, controles de reproducción y permite navegar a la playlist actual. También maneja eventos de clic para reproducir canciones y abrir menús contextuales.
// Este componente es parte de la interfaz de usuario del reproductor, y se integra con los servicios de PlayerService y PlaylistService para gestionar la reproducción y las playlists.

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.html',
  styleUrls: ['./player.scss']
})
export class Player {
  public playerService = inject(PlayerService);
  public playlistService = inject(PlaylistService);
  private router = inject(Router);

  goToPlaylist(id: number) {
    this.playerService.closeExpandedView();
    this.router.navigate(['/playlist', id]);
  }

  playTrack(song: Song) {
    const context = this.playerService.currentContext();
    if (context) {
      this.playerService.playSong(song, context);
    } else {
      this.playerService.playSong(song);
    }
  }

  openMenu(song: Song, event: MouseEvent) {
    event.stopPropagation();
    this.playlistService.openGlobalSongMenu(song, event, true);
  }

  // Maneja el evento de clic en una canción. Si la canción clicada es la misma que la canción actual, alterna la reproducción (play/pause). Si es una canción diferente, inicia la reproducción de esa canción en el contexto actual.
  onSongClick(song: Song, context: any) {
    if (this.playerService.currentSong()?.id === song.id) {
      this.playerService.togglePlay();
    } else {
      this.playerService.playSong(song, context);
    }
  }
}