import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatMenuTrigger } from "@angular/material/menu";
import { Router } from "@angular/router";
import { debounce, interval } from "rxjs";
import { PagedList } from "src/app/core/models/paged-list";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { PlayerData } from "src/app/dashboard/components/interfaces/player-data";
import { PlayerParams } from "src/app/dashboard/components/interfaces/player-params";
import { AudioSource } from "src/app/dashboard/models/player/audio-source";
import { PlayerService } from "src/app/dashboard/services/player.service";
import { Item } from "src/app/shared/models/item";
import { Song } from "../../models/songs/song";
import { AlbumService } from "../../services/album.service";
import { PlaylistSongsService } from "../../services/playlist-songs.service";
import { PlaylistService } from "../../services/playlist.service";
import { SongService } from "../../services/song.service";
import { Playlist } from "../../models/playlists/playlist";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [SongService, AlbumService, PlaylistService, ImageService, PlaylistSongsService, AccountService]
})
export class SearchComponent implements OnInit{
    searchForm!: FormGroup;
    albums: Item[] = [];
    playlists: Item[] = [];
    artists: Item[] = [];
    pageNumber: number = 1;
    pageSize: number = 20;
    orderBy?: string;
    songList: PagedList<Song[]> = new PagedList<Song[]>(this.pageNumber, this.pageSize, 1, 0, []);
    totalPages: number = 1;
    columns: string[] = [ '#', 'Title', 'Artists', 'Album', 'Duration' ];
    menuPosition =  {x: '0', y: '0'};
    filter!: Filter;
    currentSong!: Song;
    userPlaylists!: Playlist[];

    @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

    constructor(private songService: SongService, private albumService: AlbumService, private imageService: ImageService,
        private playlistService: PlaylistService, private errorService: ErrorHandlingService, private router: Router,
        private playlistSongService: PlaylistSongsService, private accountService: AccountService, private playerService: PlayerService){}

    ngOnInit(): void {
        this.searchForm = new FormGroup({
            searchTerm: new FormControl(''),
            searchType: new FormControl('Album', [Validators.required])
        });

        this.searchForm.valueChanges.pipe(debounce(() => interval(400))).subscribe({
            next: (value) => {
                if(value){
                    this.albums = [];
                    this.playlists = [];
                    this.artists = [];
                    this.songList.items = [];
                    this.pageNumber = 1;
                    this.search(value.searchTerm);
                }
            }
        });

        this.playerService.getPlayerData().subscribe({
            next: (data) => {
                this.currentSong = data.currentSong;
            }
        });

        this.getUserPlaylists();
    }

    get searchTerm(){
        return this.searchForm.get('searchTerm') as FormControl;
    }

    get searchType(){
        return this.searchForm.get('searchType') as FormControl;
    }

    search(value: string){
        if(this.searchTerm.value == ''){
            this.albums = [];
            this.playlists = [];
            this.artists = [];
            this.songList.items = [];
        }
        else if(this.searchType.value == "Album"){
            this.getAlbums(value);
        }
        else if(this.searchType.value == "Playlist"){
            this.getPlaylists(value);
        }
        else if(this.searchType.value == "Artist"){
            this.getArtists(value);
        }
        else if(this.searchType.value == "Song"){
            this.getSongs(value);
        }
        else{
            this.errorService.setError("This value is not allowed");
        }
    }

    sort(column: string){
        this.orderBy = column;
        this.songList.items = [];
        this.getSongs(this.searchTerm.value);
    }

    getAlbums(searchTerm: string){
        let filterCondition = [new FilterCondition("Title", FilterConditionType.Contains, searchTerm)];
        let filter = new Filter(Operators.And, filterCondition);
        let params = new QueryParameters(filter, "Year desc", this.pageNumber, 20);

        this.albumService.getAlbums(params).subscribe({
            next: (response) => {
                this.totalPages = response.data.totalPages;
                var albums = response.data.items.map(x =>{
                    var poster = this.imageService.convertResponseToImage(x.poster);
                    let title = `${x.title} ${x.year}`;
                    return new Item(x.id, poster, title);
                });

                this.albums = this.albums.concat(albums);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    getSongs(searchTerm: string){
        let filterCondition = [new FilterCondition("Title", FilterConditionType.Contains, searchTerm)];
        this.filter = new Filter(Operators.And, filterCondition);

        this.songService.getSongs(this.pageNumber, this.pageSize, undefined, this.filter, this.orderBy).subscribe({
            next: (response) => {
                this.totalPages = response.data.totalPages;

                if(this.pageNumber <= this.totalPages){
                    let songs = this.songList.items.concat(response.data.items.filter(x => x.isArchived == false));
                    this.songList = new PagedList<Song[]>(this.pageNumber, 20, this.totalPages, 0, []);
                    this.songList.items = songs;
                    this.songList.currentPage = response.data.currentPage;
                    this.songList.pageSize = response.data.pageSize;
                    this.songList.totalPages = response.data.totalPages;
                    this.songList.totalRecords = response.data.totalRecords;
                    this.totalPages = response.data.totalPages;
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    getPlaylists(searchTerm: string){
        let filterCondition = [new FilterCondition("Title", FilterConditionType.Contains, searchTerm)];
        let filter = new Filter(Operators.And, filterCondition);
        let params = new QueryParameters(filter, "Title desc", this.pageNumber, 20);

        this.playlistService.getPlaylists(params).subscribe({
            next: (response) => {
                this.totalPages = response.data.totalPages;

                let playlists = response.data.items.filter(x => x.isCustom == true).map(x =>{
                    if(x.poster){
                        x.poster = this.imageService.convertResponseToImage(x.poster);
                    }
                    else{
                        x.poster = '../assets/img/playlist.png';
                    }
                    return new Item(x.id, x.poster, x.title);
                });

                this.playlists = this.playlists.concat(playlists);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    getArtists(searchTerm: string){
        let filer = new FilterCondition("FullName", FilterConditionType.Contains, searchTerm);

        this.songService.getArtists(filer, 20, this.pageNumber).subscribe({
            next: (response) => {
                this.totalPages = response.data.totalPages;

                if(this.pageNumber <= this.totalPages){
                    this.artists = response.data.items.map(x => {
                        let profilePicture;
                        if(x.profilePicture){
                            profilePicture = this.imageService.convertResponseToImage(x.profilePicture);
                        }
                        else{
                            profilePicture = 'assets/img/profile-picture-default.jpg';
                        }

                        return new Item(x.id, profilePicture, x.artistName)
                    });
                }
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    goToAlbum(item: Item){
        this.router.navigate([`albums/${item.id}`]);
    }

    goToPlaylist(item: Item){
        this.router.navigate([`playlists/${item.id}`]);
    }
    goToArtist(item: Item){
        this.router.navigate([`profile/${item.id}`]);
    }

    changePage(pageNumber: number) {
        if(pageNumber <= this.totalPages){
            this.pageNumber = pageNumber;
            this.search(this.searchTerm.value);
        }
    }

    openMenu(menuData: {position: {x: string, y: string}, song: Song}) {
        this.menuPosition = menuData.position;
        this.matMenuTrigger.menuData = {song: menuData.song};

        this.matMenuTrigger.menuData = {playlists: this.userPlaylists, song: menuData.song};
        this.matMenuTrigger.openMenu();
    }

    getUserPlaylists(){
        var filterArr: FilterCondition[] = [];
        filterArr.push(new FilterCondition("OwnerId", FilterConditionType.Equal, this.accountService.getUserId()));
        var filter = new Filter(Operators.And, filterArr);
        var params = new QueryParameters(filter, "Title desc", 1, 10);
        this.playlistService.getPlaylists(params).subscribe({
            next: (response) => {
                this.userPlaylists = response.data.items.filter(x => x.isCustom == true);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }

    addToPlaylist(song: Song, playlistId: string){
        this.playlistSongService.addSongToPlaylist(playlistId, song.id, song.albumId).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    closeMenu(){
        this.matMenuTrigger.closeMenu(); 
    }

    playSong(song: Song){
        let params: PlayerParams = {
            fiter: this.filter,
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