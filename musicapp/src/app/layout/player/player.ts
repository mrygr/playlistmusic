import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from '../../core/services/player';
import { PlaylistService, Song } from '../../core/services/playlist';

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

  // CORRECCIÓN AQUÍ: Cambiamos Event por MouseEvent
  openMenu(song: Song, event: MouseEvent) {
    event.stopPropagation();
    this.playlistService.openGlobalSongMenu(song, event, true);
  }

  onSongClick(song: Song, context: any) {
    // Si la canción clicleada ya es la actual, simplemente la pausamos o despausamos
    if (this.playerService.currentSong()?.id === song.id) {
      this.playerService.togglePlay();
    } else {
      this.playerService.playSong(song, context);
    }
  }
}