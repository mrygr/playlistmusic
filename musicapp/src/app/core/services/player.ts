import { Injectable, signal, inject } from '@angular/core';
import { Song, Playlist } from './playlist';
import { NotificationService } from './notification';


// Servicio de reproducción de música que maneja la lógica de reproducción, cambio de canciones, manejo de errores y estado del reproductor.
// Utiliza señales para gestionar el estado reactivo del reproductor, como la canción actual, el contexto de reproducción, si está reproduciendo o cargando, y si hay errores.
// Implementa funciones para reproducir una playlist completa, reproducir una canción individual, cambiar a la siguiente o anterior pista, y manejar errores de reproducción de manera robusta.
// Incluye una "memoria" para recordar la última canción que se reprodujo correctamente, lo que permite volver a ella si la canción actual falla.
// El servicio también se encarga de mostrar notificaciones al usuario en caso de errores o actualizaciones en la cola de reproducción, utilizando el NotificationService.

export interface PlayContext extends Playlist {
  totalDurationFormatted?: string;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private notificationService = inject(NotificationService);

  public currentSong = signal<Song | null>(null);
  public currentContext = signal<PlayContext | null>(null);
  public isPlaying = signal<boolean>(false);
  public isExpanded = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public hasError = signal<boolean>(false);
  public removingSongId = signal<number | null>(null);

  private audio = new Audio();
  private loadTimeout: any;
  private artificialDelayTimeout: any;

  private activeAudioSong: Song | null = null;

  // VARIABLE DE MEMORIA: Guarda la última canción que se reprodujo correctamente, para poder volver a ella si la actual falla.
  private lastKnownGoodSong: Song | null = null;

  constructor() {
    this.audio.addEventListener('ended', () => {
      if (this.hasNextTrack()) {
        this.nextTrack();
      } else {
        this.isPlaying.set(false);
        this.audio.pause();
        this.audio.currentTime = 0;
      }
    });

    this.audio.addEventListener('playing', () => {
      this.isLoading.set(false);
      this.isPlaying.set(true);
      clearTimeout(this.loadTimeout);

      this.lastKnownGoodSong = this.activeAudioSong;
    });

    this.audio.addEventListener('waiting', () => this.isLoading.set(true));

    this.audio.addEventListener('error', () => {
      if (this.activeAudioSong) {
        this.handlePlayError('El enlace del audio está roto o es inaccesible.', this.activeAudioSong);
      }
    });
  }

  private calculateTotalDuration(songs: Song[]): string {
    const totalSeconds = songs.reduce((acc: number, song: Song) => {
      let songSeconds = 0;
      if (typeof song.duration === 'string' && song.duration.includes(':')) {
        const parts = song.duration.split(':');
        songSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
      return acc + songSeconds;
    }, 0);
    return this.formatDuration(totalSeconds);
  }

  public playPlaylist(playlist: Playlist) {
    const currentSong = this.currentSong();

    // Siempre calculamos y actualizamos la cola en segundo plano primero
    const newDuration = this.calculateTotalDuration(playlist.songs);
    const newContext: PlayContext = { ...playlist, totalDurationFormatted: newDuration };
    this.currentContext.set(newContext);

    // Si la playlist está vacía, limpiamos todo
    if (!newContext.songs || newContext.songs.length === 0) {
      this.stopAndClearQueue();
      return;
    }

    const firstSong = newContext.songs[0];

    if (currentSong?.id === firstSong.id) {

      if (this.hasError()) {
        // Si había error, forzamos la reproducción
        this.executePlay(firstSong);
        this.isExpanded.set(true);
      } else {
        // La canción 1 ya está sonando. 
        // Solo actualizamos la cola de fondo, abrimos el reproductor y notificamos.
        this.isExpanded.set(true);
        this.notificationService.show('Cola de reproducción actualizada', 'success');

        if (!this.isPlaying() && !this.isLoading()) {
          this.togglePlay();
        }
      }

    } else {
      // REINICIO / NUEVA LISTA: Estaba sonando OTRA canción distinta.
      // Reproducimos la canción 1, abrimos el reproductor, pero OMITIMOS la notificación 
      // porque el cambio de audio ya es retroalimentación suficiente para el usuario.
      this.executePlay(firstSong);
      this.isExpanded.set(true);
    }
  }

  public playSong(song: Song, context?: PlayContext) {

    if (this.currentSong()?.id === song.id) {
      if (this.hasError()) {
        this.executePlay(this.currentSong()!);
      } else if (!this.isLoading()) {
        this.togglePlay();
      }
      return;
    }
    // CAMBIO DE CONTEXTO REAL: Si llegó hasta aquí, es porque es una canción DIFERENTE.
    // Aquí sí es seguro limpiar o reescribir la cola de reproducción.
    if (context) {
      this.currentContext.set(context);
    } else {
      // Si el clic viene del Home o un buscador (sin contexto de playlist),
      // creamos un contenedor seguro para esta canción individual.
      const singleContext: PlayContext = {
        id: Date.now(),
        name: 'Canción individual',
        cover: song.cover,
        songs: [song],
        totalDurationFormatted: song.duration
      };
      this.currentContext.set(singleContext);
    }

    // Como es una canción nueva, disparamos la carga y reproducción
    this.executePlay(song);
  }

  private executePlay(song: Song) {
    clearTimeout(this.loadTimeout);
    clearTimeout(this.artificialDelayTimeout);

    this.audio.pause();
    this.currentSong.set(song);
    this.isLoading.set(true);
    this.isPlaying.set(false);
    this.hasError.set(false);

    this.artificialDelayTimeout = setTimeout(() => {
      if (this.currentSong()?.id !== song.id) return;

      this.activeAudioSong = song;

      this.audio.src = song.url;
      this.audio.load();

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.warn("Interrupción normal al cambiar rápido:", error));
      }

      this.loadTimeout = setTimeout(() => {
        if (this.isLoading() && this.currentSong()?.id === song.id) {
          this.handlePlayError('La conexión está lenta o el enlace falló.', song);
        }
      }, 10000);

    }, 800);
  }

  /* Maneja los errores de reproducción */
  // algunos errores pueden ser temporales (enlace caído momentáneamente, red lenta) y otros permanentes (archivo eliminado, enlace roto).
  // La estrategia de manejo es:
  // - Si la canción con error no es la actual, ignoramos (puede ser un error de una canción previa que ya no está en cola).
  // - Si es la actual, mostramos notificación de error y marcamos el estado.
  // - Si el contexto actual tiene más canciones, eliminamos la canción corrupta de la cola y seguimos reproduciendo normalmente.
  // - Si la canción corrupta era la última de la cola, intentamos volver a la última canción que se reprodujo correctamente (si existe en la cola actual). Si no hay ninguna válida, vaciamos la cola.
  private handlePlayError(msg: string, failedSong: Song) {
    clearTimeout(this.loadTimeout);
    clearTimeout(this.artificialDelayTimeout);

    if (this.currentSong()?.id !== failedSong.id) return;

    this.isPlaying.set(false);
    this.hasError.set(true);
    this.notificationService.show(msg, 'error');

    const ctx = this.currentContext();
    if (!ctx) {
      this.stopAndClearQueue(false);
      return;
    }

    this.removingSongId.set(failedSong.id);

    setTimeout(() => {
      if (ctx.songs.length === 1) {
        this.stopAndClearQueue(false);
        this.removingSongId.set(null);
        return;
      }

      const currentIndex = ctx.songs.findIndex(s => s.id === failedSong.id);
      const isLastSong = currentIndex === ctx.songs.length - 1;

      const updatedSongs = ctx.songs.filter(s => s.id !== failedSong.id);
      const updatedDuration = this.calculateTotalDuration(updatedSongs);

      this.currentContext.set({ ...ctx, songs: updatedSongs, totalDurationFormatted: updatedDuration });
      this.removingSongId.set(null);

      if (isLastSong) {
        // BUSCAMOS EN LA MEMORIA: ¿Teníamos una canción previa que sí funcionaba?
        // Si existe, validamos que aún esté en la lista actual.
        const originSong = this.lastKnownGoodSong
          ? updatedSongs.find(s => s.id === this.lastKnownGoodSong!.id)
          : null;

        if (originSong) {
          // Volvemos a la zona segura (el origen) y la dejamos lista pero en pausa
          this.currentSong.set(originSong);
          this.activeAudioSong = originSong;

          this.audio.src = originSong.url;
          this.audio.load();
          this.audio.pause();

          this.isLoading.set(false);
          this.isPlaying.set(false);
          this.hasError.set(false);
        } else {
          // Si no había origen (fue el primer clic), simplemente vaciamos la cola
          this.stopAndClearQueue(false);
        }
        return;
      }

      // Si la corrupta no era la última, el auto-play sigue su curso hacia adelante
      this.executePlay(updatedSongs[currentIndex]);

    }, 400);
  }

  public togglePlay() {
    if (this.currentSong() && !this.isLoading()) {
      if (this.hasError()) {
        this.executePlay(this.currentSong()!);
      } else {
        if (this.isPlaying()) this.audio.pause();
        else this.audio.play();
        this.isPlaying.update(val => !val);
      }
    }
  }

  public stopAndClearQueue(closeExpanded: boolean = true) {
    clearTimeout(this.loadTimeout);
    clearTimeout(this.artificialDelayTimeout);
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = '';
    this.currentSong.set(null);
    this.currentContext.set(null);
    this.isPlaying.set(false);
    this.isLoading.set(false);
    this.hasError.set(false);

    this.activeAudioSong = null;
    this.lastKnownGoodSong = null; // Limpiamos la memoria al vaciar el reproductor

    if (closeExpanded) {
      this.isExpanded.set(false);
    }

    this.removingSongId.set(null);
  }

  private getCurrentIndex(): number {
    const ctx = this.currentContext();
    const song = this.currentSong();
    if (!ctx || !song) return -1;
    return ctx.songs.findIndex(s => s.id === song.id);
  }

  public hasPrevTrack(): boolean { return !this.isLoading() && this.getCurrentIndex() > 0; }
  public hasNextTrack(): boolean {
    const ctx = this.currentContext();
    return !this.isLoading() && ctx !== null && this.getCurrentIndex() >= 0 && this.getCurrentIndex() < ctx.songs.length - 1;
  }

  public nextTrack() {
    if (this.hasNextTrack()) this.executePlay(this.currentContext()!.songs[this.getCurrentIndex() + 1]);
  }

  public prevTrack() {
    if (this.hasPrevTrack()) this.executePlay(this.currentContext()!.songs[this.getCurrentIndex() - 1]);
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