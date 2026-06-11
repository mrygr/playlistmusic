import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification';
import { PlaylistService, Song } from '../../core/services/playlist';
import { PlayerService } from '../../core/services/player'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html', 
  styleUrl: './home.scss'    
})
export class Home implements OnInit { 
  private notificationService = inject(NotificationService);
  public playlistService = inject(PlaylistService);
  public playerService = inject(PlayerService);
  private cdr = inject(ChangeDetectorRef); // Evita problemas de actualización de UI con el esqueleto de carga

  public isLoading: boolean = true;
  public skeletonArray = [1, 2, 3, 4]; 

  // Simulamos carga de datos para mostrar el esqueleto de carga
  ngOnInit() {
    this.isLoading = true;
    this.cdr.detectChanges(); // Forzamos actualización de UI
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Finaliza el esqueleto de forma segura
    }, 800);
  }

  // Obtenemos las canciones recomendadas (simulando una lógica de recomendación)
  get recommendedSongs(): Song[] {
    return this.playlistService.allSongs.slice(0, 12);
  }

  // Método para reproducir una canción al hacer clic en ella en la lista de recomendaciones
  playSong(song: Song, event: Event) {
    event.stopPropagation();
    this.playerService.playSong(song);
  }
}