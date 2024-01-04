import { AfterContentChecked, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { AlbumDetails } from "src/app/home/models/albums/album-details";
import { AlbumType } from "src/app/home/models/albums/album-type";
import { Song } from "src/app/home/models/songs/song";
import { AlbumService } from "src/app/home/services/album.service";
import { SongEditComponent } from "../../songs/song-edit/song-edit.component";
import { EditAlbumComponent } from "../album-edit/edit-album.component";
import { MatMenuTrigger } from "@angular/material/menu";
import { PlaylistService } from "src/app/home/services/playlist.service";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { PlaylistSongsService } from "src/app/home/services/playlist-songs.service";
import { SongService } from "src/app/home/services/song.service";
import { PagedList } from "src/app/core/models/paged-list";
import { FetchService } from "src/app/dashboard/services/fetch.service";
import { PlayerService } from "src/app/dashboard/services/player.service";
import { PlayerData } from "src/app/dashboard/components/interfaces/player-data";
import { AudioSource } from "src/app/dashboard/models/player/audio-source";
import { PlayerParams } from "src/app/dashboard/components/interfaces/player-params";
import { Playlist } from "src/app/home/models/playlists/playlist";
import { ModalDelete } from "src/app/shared/components/modal-delete/modal-delete.component";
import { SongDelete } from "src/app/home/models/songs/song-delete";

@Component({
    selector: 'app-album-details',
    templateUrl: 'album-details.component.html',
    styleUrls: ['album-details.component.scss'],
    providers: [AlbumService, SongService, ImageService, AccountService, PlaylistService, PlaylistSongsService]
})
export class AlbumDetailsComponent implements OnInit, AfterContentChecked{
    albumId!: string;
    albumDetails!: AlbumDetails
    hovered: number | undefined;
    isOwner!: boolean;
    pageNumber: number = 1;
    totalPages!: number;
    pageSize: number = 20;
    songList: PagedList<Song[]> = new PagedList<Song[]>(this.pageNumber, this.pageSize, this.totalPages, 0, []);
    menuPosition =  {x: '0', y: '0'};
    orderBy?: string;
    columns: string[] = [ '#', 'Title', 'Artists', 'Favorite', 'Duration' ];
    background!: string;
    currentSong!: Song;
    playlists!: Playlist[];

    @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

    constructor(private albumService: AlbumService, private songService: SongService, private route: ActivatedRoute, private errorService: ErrorHandlingService,
        private imageService: ImageService, private router: Router, private accountService: AccountService, private playlistService: PlaylistService,
        private dialogRef: MatDialog, private playlistSongsService: PlaylistSongsService, private fetch: FetchService, private playerService: PlayerService){}
    
    ngAfterContentChecked(): void {
        this.getBackgroundColor();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.albumId = params['albumId'];
        });
        
        this.fetch.getSubj().subscribe({
            next: (value) => {
                if(value){
                    this.getAlbum();
                }
            }
        });

        this.getAlbum();

        this.playerService.getPlayerData().subscribe({
            next: (data) => {
                if(data.source == AudioSource.Album && data.params.id == this.albumId){
                    this.currentSong = data.currentSong;
                }
            }
        });

        this.getPlaylists();
    }

    getAlbum(){
        this.albumService.getAlbum(this.albumId).subscribe({
            next: (response) => {
                this.albumDetails = response.data;
                if(response.data.poster){
                    this.albumDetails.poster = this.imageService.convertResponseToImage(response.data.poster);
                }
                if(response.data.creatorId == this.accountService.getUserId()){
                    this.isOwner = true;
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => {
                this.songList.items = [];
                this.getSongs();
                if(this.albumDetails.poster){
                    this.ngAfterContentChecked();
                }
            }
        });
    }

    getSongs(){
        this.songService.getSongs(this.pageNumber, this.pageSize, this.albumId, undefined, this.orderBy).subscribe({
            next: (response) => {
                let songs = this.songList.items.concat(response.data.items);
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

    loadSongsOnScroll(pageNumber: number): void {
        if(pageNumber <= this.totalPages){
            this.pageNumber = pageNumber;
            this.getSongs();
        }
    }

    getAlbumTypeName(type: AlbumType){
        return this.albumService.getAlbumTypeName(type);
    }

    goBack(){
        this.router.navigate([`profile/${this.albumDetails.creatorId}/albums`]);
    }

    goToArtist(artistId: string){
        this.router.navigate([`profile/${artistId}`]);
    }

    editAlbum(){
        let dialogRef = this.dialogRef.open(EditAlbumComponent, {data: this.albumDetails, height: '70%'});
        dialogRef.afterClosed().subscribe({
            complete: () => {
                this.songList.items = [];
                this.getAlbum();
            }
        });
    }

    deleteAlbum(){
        let dialogRef = this.dialogRef.open(ModalDelete, {data: this.albumDetails.title});
        dialogRef.afterClosed().subscribe({
            next: (confirmed) => {
                if(confirmed){
                    this.albumService.deleteAlbum(this.albumDetails.id).subscribe({
                        error: (response) => this.errorService.setError(response.error.exception.message),
                        complete: () => this.goBack()
                    })
                }
            }
        });
    }

    editSong(song: Song){
        let dialogRef = this.dialogRef.open(SongEditComponent, {data: { song: song, albumId: this.albumId}, height: '35%'});
        dialogRef.afterClosed().subscribe({
            complete: () => {
                this.songList.items = [];
                this.getAlbum();
            }
        });
    }

    deleteSong(song: Song){
        let dialogRef = this.dialogRef.open(ModalDelete, {data: song.title});
        dialogRef.afterClosed().subscribe({
            next: (confirmed) => {
                if(confirmed){
                    let songDelete = new SongDelete(this.albumId, song.id);
                    this.songService.deleteSong(songDelete).subscribe({
                        error: (response) => this.errorService.setError(response.exception.message),
                        complete: () => {
                            this.songList.items = [];
                            this.getSongs();
                        }
                    });
                }
            }
        });
    }

    sort(column: string){
        this.orderBy = column;
        this.songList.items = [];
        this.getSongs();
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
        var params = new QueryParameters(filter, "Title desc", 1, 10);
        this.playlistService.getPlaylists(params).subscribe({
            next: (response) => {
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
            id: this.albumId,
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            orderBy: this.orderBy
        };

        let data: PlayerData = {
            currentSong: song,
            source: AudioSource.Album,
            params: params,
            songList: this.songList
        };

        this.playerService.setPlayerData(data);
    }
}