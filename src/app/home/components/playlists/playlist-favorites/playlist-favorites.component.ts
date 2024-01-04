import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { Router } from "@angular/router";
import { PagedList } from "src/app/core/models/paged-list";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { PlayerData } from "src/app/dashboard/components/interfaces/player-data";
import { PlayerParams } from "src/app/dashboard/components/interfaces/player-params";
import { AudioSource } from "src/app/dashboard/models/player/audio-source";
import { PlayerService } from "src/app/dashboard/services/player.service";
import { Playlist } from "src/app/home/models/playlists/playlist";
import { PlaylistDetails } from "src/app/home/models/playlists/playlist-details";
import { Song } from "src/app/home/models/songs/song";
import { PlaylistSongsService } from "src/app/home/services/playlist-songs.service";
import { PlaylistService } from "src/app/home/services/playlist.service";


@Component({
    selector: 'app-favorites',
    templateUrl: './playlist-favorites.component.html',
    styleUrls: ['./playlist-favorites.component.scss'],
    providers: [PlaylistService, PlaylistSongsService, AccountService]
})
export class PlaylistFavoritesComponent implements OnInit{
    playlist!: PlaylistDetails;
    hovered: number | undefined;
    pageNumber: number = 1;
    totalPages!: number;
    pageSize: number = 20;
    songList: PagedList<Song[]> = new PagedList<Song[]>(this.pageNumber, this.pageSize, this.totalPages, 0, []);
    menuPosition =  {x: '0', y: '0'};
    orderBy?: string;
    columns: string[] = [ '#', 'Title', 'Artists', 'Album', 'Favorite', 'Duration' ];
    currentSong!: Song;
    playlists!: Playlist[];

    @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
    
    constructor(private playlistService: PlaylistService, private playlistSongsService: PlaylistSongsService, private errorService: ErrorHandlingService,
        private accountService: AccountService, private playerService: PlayerService){}

    ngOnInit(): void {
        this.getPlaylist();
        this.getPlaylists();
    }

    getPlaylist(){
        this.playlistService.getFavoritesPlaylist().subscribe({
            next: (response) => {
                this.playlist = response.data;
            },
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.getSongs()
        });

        this.playerService.getPlayerData().subscribe({
            next: (data) => {
                if(data.source == AudioSource.Playlist && data.params.id == this.playlist.id){
                    this.currentSong = data.currentSong;
                }
            }
        });
    }
    
    getSongs(){
        this.playlistSongsService.getPlaylistSongs(this.playlist.id, this.pageNumber, this.pageSize, this.orderBy).subscribe({
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
    
    loadSongsOnScroll(pageNumber: number): void {
        if(this.pageNumber <= this.totalPages){
            this.pageNumber += pageNumber;
            this.getSongs();
        }
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
        var params = new QueryParameters(filter, "Title desc", 1, 20);
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

    playSong(song: Song){
        let params: PlayerParams = {
            id: this.playlist.id,
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