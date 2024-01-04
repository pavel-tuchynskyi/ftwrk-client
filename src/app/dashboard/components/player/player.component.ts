import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PagedList } from "src/app/core/models/paged-list";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { Song } from "src/app/home/models/songs/song";
import { PlaylistSongsService } from "src/app/home/services/playlist-songs.service";
import { SongService } from "src/app/home/services/song.service";
import { AudioSource } from "../../models/player/audio-source";
import { AudioService } from "../../services/audio.service";
import { PlayerService } from "../../services/player.service";
import { PlayerData } from "../interfaces/player-data";
import { StreamState } from "../interfaces/stream-state";

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    providers: [SongService, PlaylistSongsService]
})
export class PlayerComponent implements OnInit{
    state!: StreamState;
    playerData?: PlayerData;
    totalSongs: number = 0;
    audioContext = new AudioContext();

    constructor(private audioService: AudioService, private playerService: PlayerService, private songService: SongService,
        private router: Router, private playerSongService: PlaylistSongsService, private errorService: ErrorHandlingService){}

    ngOnInit(): void {
        this.getPlayerData();
        this.getState();
    }

    getPlayerData(){
        this.playerService.getPlayerData().subscribe({
            next: (data) => {
                if(data){
                    this.playerData = undefined;
                    this.playerData = data;
                    let url = this.songService.getSongUrl(data.currentSong.albumId, data.currentSong.id);
                    this.playStream(url);
                }
            }
        });
    }

    getState(){
        this.audioService.getState().subscribe(state => {
            this.state = state;
            
            if(this.playerData && state.duration == state.currentTime){
                this.next();
            }
        });
    }

    private getNext(){
        if(this.playerData!.source == AudioSource.Album 
            && this.playerData!.params.pageNumber < this.playerData!.songList.totalPages){
            this.playerData!.params.pageNumber += 1;
            this.getAlbumSongs();
        }
        else if(this.playerData!.source == AudioSource.Playlist
            && this.playerData!.params.pageNumber < this.playerData!.songList.totalPages){
            this.playerData!.params.pageNumber += 1;
            this.getPlaylistSongs();
        }
        else{
            this.errorService.setError('Source is not provided');
        }
    }

    private getAlbumSongs(){
        let params = this.playerData!.params;
        this.songService.getSongs(params.pageNumber, params.pageSize, params.id, params.fiter, params.orderBy).subscribe({
            next: (response) => {
                this.setResponseData(response.data);
            }
        })
    }

    private getPlaylistSongs(){
        let params = this.playerData!.params;
        this.playerSongService.getPlaylistSongs(params.id!, params.pageNumber, params.pageSize, params.orderBy).subscribe({
            next: (response) => {
                this.setResponseData(response.data);
            }
        })
    }

    private setResponseData(response: PagedList<Song[]>){
        this.playerData!.songList.items = this.playerData!.songList.items.concat(response.items);
        this.playerData!.songList.currentPage = response.currentPage;
        this.playerData!.songList.pageSize = response.pageSize;
        this.playerData!.songList.totalPages = response.totalPages;
        this.playerData!.songList.totalRecords = response.totalRecords;
    }

    playStream(url: string) {
        this.audioService.playStream(url).subscribe({});
    }

    pause() {
        this.audioService.pause();
    }

    play() {
        this.audioService.play();
    }

    stop() {
        this.audioService.stop();
    }

    next() {
        if(this.isLastPlaying()){
            this.audioService.stop();
        }

        let currentIndex = this.playerData!.songList.items.findIndex(x => x.id == this.playerData!.currentSong.id);

        if(currentIndex === this.playerData!.songList.items.length - 1 && this.playerData!.songList.items.length < this.playerData!.songList.totalRecords){
            this.getNext();
            this.next();
        }
        else{
            this.playerData!.currentSong = this.playerData!.songList.items[currentIndex + 1];

            if(this.playerData!.currentSong.isArchived){
                this.next();
            }

            this.playerService.setPlayerData(this.playerData!);
            let url = this.songService.getSongUrl(this.playerData!.currentSong.albumId, this.playerData!.currentSong.id);
            this.playStream(url);
        }
    }

    previous() {
        if(this.isLastPlaying()){
            this.audioService.stop();
        }
        
        let currentIndex = this.playerData!.songList.items.findIndex(x => x.id == this.playerData!.currentSong.id);
        this.playerData!.currentSong = this.playerData!.songList.items[currentIndex - 1];

        if(this.playerData!.currentSong.isArchived){
            this.previous();
        }

        this.playerService.setPlayerData(this.playerData!);
        let url = this.songService.getSongUrl(this.playerData!.currentSong.albumId, this.playerData!.currentSong.id);
        this.playStream(url);
    }

    isFirstPlaying() {
        if(this.playerData){
            return this.playerData.songList.items.findIndex(x => x.id == this.playerData!.currentSong.id) === 0;
        }
        else{
            return false;
        }
    }

    isLastPlaying() {
        if(this.playerData){
            return this.playerData.songList.items.findIndex(x => x.id == this.playerData!.currentSong.id) === this.playerData.songList.totalRecords - 1;
        }
        else{
            return false;
        }
    }

    onSliderChangeEnd(change: any) {
        this.audioService.seekTo(change.value as number);
    }

    changeVolume(change: any){
        this.audioService.changeVoulume(change.value as number);
    }

    getVolume(){
        return this.audioService.getVolume();
    }

    goToArtist(artistId: string){
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/profile', artistId]));
    }
}