import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { PagedList } from "src/app/core/models/paged-list";
import { Song } from "src/app/home/models/songs/song";
import { PlayerData } from "../components/interfaces/player-data";

@Injectable({
    providedIn: 'root'
})
export class PlayerService{
    // private songs = new BehaviorSubject<any>({});
    // private currentSong = new BehaviorSubject<any>(undefined);
    // private getNext = new BehaviorSubject<boolean>(false);

    private playerData!: PlayerData;
    private playerData$ = new BehaviorSubject<PlayerData>(this.playerData);

    setPlayerData(data: PlayerData){
        this.playerData$.next(data);
    }

    getPlayerData(){
        return this.playerData$.asObservable();
    }

    // setSongs(songs: PagedList<Song[]>){
    //     this.songs.next(songs);
    // }

    // getSong(){
    //     return this.songs.asObservable();
    // }

    // setNextSongs(){
    //     this.getNext.next(true);
    // }

    // getNextSongs(){
    //     return this.getNext.asObservable();
    // }

    // onSongsChanges(){

    // }

    // setCurrent(song: Song){
    //     this.currentSong.next(song);
    // }

    // getCurrent(){
    //     return this.currentSong.asObservable();
    // }
}