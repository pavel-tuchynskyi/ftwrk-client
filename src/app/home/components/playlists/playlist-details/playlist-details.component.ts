import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { AfterContentChecked, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { PagedList } from "src/app/core/models/paged-list";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { PlayerData } from "src/app/dashboard/components/interfaces/player-data";
import { PlayerParams } from "src/app/dashboard/components/interfaces/player-params";
import { AudioSource } from "src/app/dashboard/models/player/audio-source";
import { PlayerService } from "src/app/dashboard/services/player.service";
import { Playlist } from "src/app/home/models/playlists/playlist";
import { PlaylistDetails } from "src/app/home/models/playlists/playlist-details";
import { PlaylistSongUpdate } from "src/app/home/models/playlists/playlist-song-update";
import { Song } from "src/app/home/models/songs/song";
import { PlaylistSongsService } from "src/app/home/services/playlist-songs.service";
import { PlaylistService } from "src/app/home/services/playlist.service";
import { PlaylistEditComponent } from "../playlist-edit/playlist-edit.component";
import { ModalDelete } from "src/app/shared/components/modal-delete/modal-delete.component";

@Component({
    selector: 'app-playlist-details',
    templateUrl: 'playlist-details.component.html',
    styleUrls: ['playlist-details.component.scss'],
    providers: [AccountService, ImageService, PlaylistSongsService]
})
export class PlaylistDetailsComponent implements OnInit, AfterContentChecked{
    id!: string;
    playlist!: PlaylistDetails;
    poster!: SafeUrl;
    isOwner!: boolean;
    pageNumber: number = 1;
    totalPages!: number;
    pageSize: number = 20;
    songList: PagedList<Song[]> = new PagedList<Song[]>(this.pageNumber, this.pageSize, this.totalPages, 0, []);
    menuPosition =  {x: '0', y: '0'};
    orderBy?: string;
    columns: string[] = [ '#', 'Title', 'Artists', 'Album', 'Favorite', 'Duration' ];
    favoritePlaylist!: Playlist;
    playlists!: Playlist[];
    background!: string;
    currentSong!: Song;

    @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

    constructor(private playlistService: PlaylistService, private playlistSongsService: PlaylistSongsService, private route: ActivatedRoute, 
        private errorService: ErrorHandlingService, private imageService: ImageService, private router: Router, private accountService: AccountService, 
        private dialogRef: MatDialog, private playerService: PlayerService){}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.id = params['playlistsId'];
        });

        this.getPlaylist();

        this.playerService.getPlayerData().subscribe({
            next: (data) => {
                if(data.source == AudioSource.Playlist && data.params.id == this.id){
                    this.currentSong = data.currentSong;
                }
            }
        });

        this.getPlaylists();
    }

    ngAfterContentChecked(): void {
        this.getBackgroundColor();
    }

    getPlaylist(){
        this.playlistService.getCustomPlaylist(this.id).subscribe({
            next: (response) => {
                this.playlist = response.data;
                if(response.data.poster.imageBytes.length > 0){
                    this.poster = this.imageService.convertResponseToImage(response.data.poster);
                }
                if(response.data.ownerId == this.accountService.getUserId()){
                    this.isOwner = true;
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                this.getSongs();
                if(this.poster){
                    this.ngAfterContentChecked();
                }
            }
        });
    }

    getSongs(){
        this.playlistSongsService.getPlaylistSongs(this.id, this.pageNumber, this.pageSize, this.orderBy).subscribe({
            next: (response) => {
                let songs = this.songList.items.concat(response.data.items.filter(x => x.isArchived == false));
                this.songList = new PagedList<Song[]>(this.pageNumber, this.pageSize, this.totalPages, 0, []);
                this.songList.items = songs;
                this.songList.currentPage = response.data.currentPage;
                this.songList.pageSize = response.data.pageSize;
                this.songList.totalPages = response.data.totalPages;
                this.songList.totalRecords = response.data.totalRecords;
                this.totalPages = response.data.totalPages;
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    sort(column: string){
        this.orderBy = column;
        this.songList.items = [];
        this.getSongs();
    }

    loadSongsOnScroll(pageNumber: number): void {
        if(this.pageNumber < this.totalPages){
            this.pageNumber += pageNumber;
            this.getSongs();
        }
    }

    goBack(){
        this.router.navigate([`profile/${this.playlist.ownerId}/playlists`]);
    }

    editPlaylist(){
        let dialogRef = this.dialogRef.open(PlaylistEditComponent, {data: this.playlist});
        dialogRef.afterClosed().subscribe({
            complete: () => this.getPlaylist()
        });
    }

    goToProfile(id: string){
        this.router.navigate([`profile/${id}`]);
    }

    deletePlaylist(){
        let dialogRef = this.dialogRef.open(ModalDelete, {data: this.playlist.title});
        dialogRef.afterClosed().subscribe({
            next: (response) => {
                if(response == true){
                    this.playlistService.deletePlaylist(this.playlist.id).subscribe({
                        error: (response) => this.errorService.setError(response.error.exception.message),
                        complete: () => this.goBack()
                    });
                }
            }
        })
    }

    updateSongPosition(songUpdate: {song: Song, previous?: string, next?: string}){
        let playlistSongUpdate = new PlaylistSongUpdate(this.playlist.id, songUpdate.song.id, songUpdate.song.albumId, songUpdate.previous, songUpdate.next);
        this.playlistSongsService.updatePlaylistSong(playlistSongUpdate).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    openMenu(menuData: {position: {x: string, y: string}, song: Song}) {
        this.menuPosition = menuData.position;
        this.matMenuTrigger.menuData = {song: menuData.song};

        this.matMenuTrigger.menuData = {playlists: this.playlists, song: menuData.song};
        this.matMenuTrigger.openMenu();
    }

    getPlaylists(){
        var filterArr: FilterCondition[] = [];
        filterArr.push(new FilterCondition("OwnerId", FilterConditionType.Equal, this.accountService.getUserId()));
        var filter = new Filter(Operators.And, filterArr);
        var params = new QueryParameters(filter, "Title desc", 1, 20);
        this.playlistService.getPlaylists(params).subscribe({
            next: (response) => {
                this.favoritePlaylist = response.data.items.find(x => x.isCustom == false)!;
                this.playlists = response.data.items.filter(x => x.isCustom == true);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    addToPlaylist(song: Song, playlistId: string){
        this.playlistSongsService.addSongToPlaylist(playlistId, song.id, song.albumId).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    deleteSong(songId: string){
        this.playlistSongsService.deletePlaylistSong(this.playlist.id, songId).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                this.songList.items = this.songList.items.filter(x => x.id != songId)
            }
        });
    }

    closeMenu(){
        this.matMenuTrigger.closeMenu(); 
    }

    getBackgroundColor(){
        if(document.querySelector('#poster') && !this.background){
            let avg = this.imageService.getAverageRGB(document.querySelector('#poster'));
            if(avg.r > this.imageService.defaultRGB.r && avg.g > this.imageService.defaultRGB.g && avg.b > this.imageService.defaultRGB.b){
                avg = this.imageService.defaultRGB;
            }
            this.background = `linear-gradient(rgb(${avg.r},${avg.g},${avg.b}) 10%, rgb(${avg.r - 40},${avg.g - 40},${avg.b - 40}) 35%, rgb(0, 0, 0))`;
        }
    }

    playSong(song: Song){
        let params: PlayerParams = {
            id: this.id,
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            orderBy: this.orderBy
        };

        let data: PlayerData = {
            currentSong: song,
            source: AudioSource.Playlist,
            params: params,
            songList: this.songList
        };

        this.playerService.setPlayerData(data);
    }
}