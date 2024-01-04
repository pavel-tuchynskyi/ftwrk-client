import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";
import { Sort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { Router } from "@angular/router";
import { PagedList } from "src/app/core/models/paged-list";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { StreamState } from "src/app/dashboard/components/interfaces/stream-state";
import { AudioService } from "src/app/dashboard/services/audio.service";
import { PlaylistDetails } from "src/app/home/models/playlists/playlist-details";
import { Song } from "src/app/home/models/songs/song";
import { PlaylistSongsService } from "src/app/home/services/playlist-songs.service";
import { PlaylistService } from "src/app/home/services/playlist.service";


@Component({
    selector: 'app-song-list',
    templateUrl: './song-list.component.html',
    styleUrls: ['./song-list.component.scss'],
    providers: [PlaylistService]
})
export class SongListComponent implements OnInit {
    hovered: number | undefined;
    orderBy?: string;
    pageNumber: number = 1;
    favorite!: PlaylistDetails;
    songState!: StreamState;
    
    @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;
    @ViewChild('table') table!: MatTable<any>;

    @Input('currentSong') currentSong!: Song;
    @Input('allowDrag') allowDrag!: boolean;
    @Input('columns') columns: string[] = [];
    @Input('songs') songList!: PagedList<Song[]>;
    @Input('isFavoritePlaylist') isFavoritePlaylist: boolean = false;

    @Output('pageNumber') nextPage = new EventEmitter<number>();
    @Output('sort') sortBy = new EventEmitter<string>();
    @Output('songUpdate') songUpdate = new EventEmitter<{song: Song, previous: string | undefined, next: string | undefined}>();
    @Output('contextMenuData') contextMenuData = new EventEmitter<{position: {x: string, y: string}, song: Song}>();
    @Output('songToPlay') songToPlay = new EventEmitter<Song>();

    constructor(private router: Router, private playlistSongService: PlaylistSongsService, private playlistService: PlaylistService,
        private errorService: ErrorHandlingService, private audioService: AudioService){}
    
    ngOnInit(): void {
        this.audioService.getState().subscribe({
            next: (state) => this.songState = state
        });
        
        this.getFavorite();
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.songList.items, event.previousIndex, event.currentIndex);

        let song = this.songList.items[event.currentIndex];
        let previousId = this.songList.items[event.currentIndex - 1] ? this.songList.items[event.currentIndex - 1].id : undefined;
        let nextId = this.songList.items[event.currentIndex + 1] ? this.songList.items[event.currentIndex + 1].id : undefined;
        this.songUpdate.emit({song: song, previous: previousId, next: nextId});
        this.table.renderRows();
    }

    showCell(cell: string){
        return !this.columns.includes(cell);
    }

    sort(sort: Sort){
        if(sort.direction){
            this.orderBy = `${sort.active} ${sort.direction}`;
            this.allowDrag = false;
        }
        else{
            this.orderBy = undefined;
            this.allowDrag = true;
        }

        this.sortBy?.emit(this.orderBy);
    }

    onScroll(): void {
        if(this.pageNumber < this.songList.totalPages){
            this.pageNumber += 1;
            this.nextPage.emit(this.pageNumber);
        }
    }

    goToAlbum(albumId: string){
        this.router.navigate([`albums/${albumId}`]);
    }

    goToArtist(artistId: string){
        this.router.navigate([`profile/${artistId}`]);
    }

    convertDuration(duration: number){
        let durationString = duration.toString();
        let index = durationString.indexOf('.');
        return durationString.slice(0, index);
    }

    openMenu(event: MouseEvent, song: Song) {
        event.preventDefault();

        this.contextMenuData.emit({
            position: {
                x: event.clientX + 'px',
                y: event.clientY + 'px'
            },
            song: song
        });
    }

    getFavorite(){
        this.playlistService.getFavoritesPlaylist().subscribe({
            next: (response) => this.favorite = response.data,
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    addToFavorite(song: Song){
        this.playlistSongService.addSongToPlaylist(this.favorite.id, song.id, song.albumId).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                let index = this.songList.items.findIndex(x => x.id == song.id);
                this.songList.items[index].isFavorite = true;
            }
        });
    }

    deleteFromFavorite(song: Song){
        this.playlistSongService.deletePlaylistSong(this.favorite.id, song.id).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                if(!this.isFavoritePlaylist){
                    let index = this.songList.items.findIndex(x => x.id == song.id);
                    this.songList.items[index].isFavorite = false;
                }
                else{
                    let index = this.songList.items.findIndex(x => x.id == song.id);
                    this.songList.items.splice(index, 1);
                    this.table.renderRows();
                }
            }
        })
    }

    playOrResume(song: Song){
        if(!this.songState.playing){
            this.audioService.play();
        }
        else{
            this.playSong(song);
        }
    }

    playSong(song: Song){
        if(!song.isArchived){
            this.songToPlay.emit(song);
        }
    }

    pauseSong(){
        this.audioService.pause();
    }
}