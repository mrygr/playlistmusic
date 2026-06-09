import { Injectable, signal } from '@angular/core';
import { Song, Playlist } from './playlist';

export interface PlayContext extends Playlist {
  totalDurationFormatted?: string;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  public currentSong = signal<Song | null>(null);
  public currentContext = signal<PlayContext | null>(null);
  public isPlaying = signal<boolean>(false);
  public isExpanded = signal<boolean>(false);

  // MOTOR DE AUDIO NATIVO
  private audio = new Audio();

  constructor() {
    // Escucha cuando una canción termina para saltar a la siguiente
    this.audio.addEventListener('ended', () => this.nextTrack());
  }

  // --- REPRODUCIR PLAYLIST (Borra la cola anterior) ---
  public playPlaylist(playlist: Playlist) {
    const totalSeconds = playlist.songs.reduce((acc: number, song: Song) => {
      let songSeconds = 0;
      if (typeof song.duration === 'string' && song.duration.includes(':')) {
        const parts = song.duration.split(':');
        songSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
      return acc + songSeconds;
    }, 0);
    
    const context: PlayContext = { ...playlist, totalDurationFormatted: this.formatDuration(totalSeconds) };
    this.currentContext.set(context);

    if (context.songs && context.songs.length > 0) {
      this.executePlay(context.songs[0]);
    } else {
      this.currentSong.set(null);
      this.isPlaying.set(false);
      this.audio.pause();
    }
  }

  // --- REPRODUCIR CANCIÓN INDIVIDUAL (Borra la cola o la mantiene si pertenece al contexto) ---
  public playSong(song: Song, context?: PlayContext) {
    if (context) {
      this.currentContext.set(context);
    } else {
      // Si se reproduce suelta desde el home, creamos un contexto falso de 1 sola canción
      const singleContext: PlayContext = {
        id: Date.now(), name: 'Canción individual', cover: song.cover,
        songs: [song], totalDurationFormatted: song.duration
      };
      this.currentContext.set(singleContext);
    }
    this.executePlay(song);
  }

  // MÉTODO INTERNO PARA EJECUTAR EL AUDIO
  private executePlay(song: Song) {
    this.currentSong.set(song);
    this.audio.src = song.url; // URL real del MP3
    this.audio.load();
    this.audio.play();
    this.isPlaying.set(true);
  }

  public togglePlay() { 
    if (this.currentSong()) {
      if (this.isPlaying()) this.audio.pause();
      else this.audio.play();
      this.isPlaying.update(val => !val); 
    }
  }

  public stopAndClearQueue() {
    // 1. Detenemos el motor nativo de audio
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = ''; // Limpiamos la fuente para liberar memoria por completo

    // 2. Reseteamos todas tus señales al estado inicial
    this.currentSong.set(null);
    this.currentContext.set(null);
    this.isPlaying.set(false);
    this.isExpanded.set(false); // Por si se cerró sesión con el reproductor abierto
  }

  // --- LÓGICA DE SIGUIENTE / ANTERIOR ---
  private getCurrentIndex(): number {
    const ctx = this.currentContext();
    const song = this.currentSong();
    if (!ctx || !song) return -1;
    return ctx.songs.findIndex(s => s.id === song.id);
  }

  public hasPrevTrack(): boolean { return this.getCurrentIndex() > 0; }
  public hasNextTrack(): boolean {
    const ctx = this.currentContext();
    return ctx !== null && this.getCurrentIndex() >= 0 && this.getCurrentIndex() < ctx.songs.length - 1;
  }

  public nextTrack() {
    if (this.hasNextTrack()) {
      const nextSong = this.currentContext()!.songs[this.getCurrentIndex() + 1];
      this.executePlay(nextSong);
    }
  }

  public prevTrack() {
    if (this.hasPrevTrack()) {
      const prevSong = this.currentContext()!.songs[this.getCurrentIndex() - 1];
      this.executePlay(prevSong);
    }
  }

  public toggleExpandedView() { this.isExpanded.update(val => !val); }
  public closeExpandedView() { this.isExpanded.set(false); }
  
  private formatDuration(totalSeconds: number): string {
    if (!totalSeconds) return '0 min';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  }
}