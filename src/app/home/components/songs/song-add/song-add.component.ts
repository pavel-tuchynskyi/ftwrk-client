import { Component, Input, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { debounceTime } from "rxjs";
import { FilterCondition, FilterConditionType } from "src/app/core/models/query-parameters";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { FetchService } from "src/app/dashboard/services/fetch.service";
import { SongAdd } from "src/app/home/models/songs/song-add";
import { SongArtist } from "src/app/home/models/songs/song-artist";
import { SongService } from "src/app/home/services/song.service";
import * as signalR from '@microsoft/signalr';
import { signInConstants } from "src/app/core/services/auth-guard.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { SongProgress } from "src/app/home/models/songs/song-progress";

@Component({
    selector: 'app-song-add',
    templateUrl: 'song-add.component.html',
    styleUrls: ['song-add.component.scss', '../../albums/album-details/album-details.component.scss'],
    providers: [SongService]
})
export class SongAddComponent implements OnInit{
    addSongForm: FormGroup;
    songFile!: File;
    artistFilter: FormControl;
    artistList!: SongArtist[];
    connectionId: string = '';
    
    @Input('albumId') albumId!: string;
    @Input('songLenght') songLenght!: number;
    
    constructor(private errorService: ErrorHandlingService, private songService: SongService, private fetch: FetchService,
        private notify: NotificationService){
        this.addSongForm = new FormGroup({
            title: new FormControl('', [Validators.required]),
            artists: new FormArray([this.createArtistForm()])
        });
        this.artistFilter = new FormControl('');
    }

    async ngOnInit() {
        this.artistFilter.valueChanges.pipe(debounceTime(200)).subscribe({
            next: (value) => {
                let filer = new FilterCondition("FullName", FilterConditionType.Contains, value);
                this.getArtists(filer, 20, 1);
            }
        });

        let connection = new signalR.HubConnectionBuilder()
        .withUrl(this.songService.notificationUrl, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
            accessTokenFactory: () => localStorage.getItem(signInConstants.accessTokenKey)!
        })
        .build();

        connection.on('ReportProgress', (state: number) =>{
            let progress = SongProgress[state];
            this.notify.setNotification(progress);
        });

        connection.on('GetConnectionId', data => {
            this.connectionId = data;
        })

        await connection.start();
    }

    get artists(){
        return this.addSongForm.get('artists') as FormArray;
    }

    getArtists(filter: FilterCondition, pageSize: number, pageNumber: number){
        this.songService.getArtists(filter, pageSize, pageNumber).subscribe({
            next: (response) => {
                this.artistList = response.data.items;
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    uploadFile(event: Event){
        const target = event.target as HTMLInputElement;
        this.songFile = (target.files as FileList)[0];
    }

    addArtistForm(){
        this.artists.push(this.createArtistForm());
    }

    createArtistForm(){
        return new FormGroup({
            artist: new FormControl(SongArtist, [Validators.required])
        });
    }

    removeArtist(index: number){
        this.artists.removeAt(index);
    }

    addSong(){
        let song = this.addSongForm.value as SongAdd;
        song.albumId = this.albumId;
        let artists: SongArtist[] = [];
        for(let i = 0; i < this.artists.length; i++){
            let artistGroup= this.artists.at(i) as FormGroup;
            artists.push({
                id: artistGroup.value.artist.id,
                artistName: artistGroup.value.artist.artistName
            });
        }
        song.artists = artists;
        song.songBlob = this.songFile;
        song.connectionId = this.connectionId;

        this.songService.addSong(song).subscribe({
            error: (response) => this.errorService.setError(response.exception.message),
            complete: () => this.fetch.setValue(true)
        });
    }
}