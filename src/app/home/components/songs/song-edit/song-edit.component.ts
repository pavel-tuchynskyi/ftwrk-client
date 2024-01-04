import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { debounceTime } from "rxjs";
import { FilterCondition, FilterConditionType } from "src/app/core/models/query-parameters";
import { AccountService } from "src/app/core/services/account.service";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { Song } from "src/app/home/models/songs/song";
import { SongArtist } from "src/app/home/models/songs/song-artist";
import { SongEdit } from "src/app/home/models/songs/song-edit";
import { SongService } from "src/app/home/services/song.service";


@Component({
    selector: 'app-song-edit',
    templateUrl: 'song-edit.component.html',
    styleUrls: ['song-edit.component.scss'],
    providers: [SongService, AccountService]
})
export class SongEditComponent implements OnInit{
    albumId: string;
    song: Song;
    songEditForm: FormGroup;
    artistFilter: FormControl;
    artistList!: SongArtist[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: {song: Song, albumId: string}, public dialogRef: MatDialogRef<boolean>,
        private songService: SongService, private errorService: ErrorHandlingService){
        this.albumId = data.albumId;
        this.song = data.song;

        this.songEditForm = new FormGroup({
            title: new FormControl('', [Validators.required]),
            artists: new FormArray([])
        });
        this.artistFilter = new FormControl('');
    }

    ngOnInit(): void {
        this.patchEditForm();
        this.artistFilter.valueChanges.pipe(debounceTime(200)).subscribe({
            next: (value) => {
                let filer = new FilterCondition("FullName", FilterConditionType.Contains, value);
                this.getArtists(filer, 20, 1);
            }
        });
    }

    get artists(){
        return this.songEditForm.get('artists') as FormArray;
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

    patchEditForm(){
        this.song.artists.forEach(x => {
            let fg = new FormGroup({
                artist: new FormControl(x, [Validators.required])
            });

            this.artists.push(fg);
        });

        this.songEditForm.patchValue({title: this.song?.title});
    }

    getArtists(filter: FilterCondition, pageSize: number, pageNumber: number){
        this.songService.getArtists(filter, pageSize, pageNumber).subscribe({
            next: (response) => {
                this.artistList = response.data.items;
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    submit(){
        if(this.songEditForm.valid){
            let song = this.songEditForm.value as SongEdit;
            song.albumId = this.albumId;
            song.songId = this.song.id;
            let artists: SongArtist[] = [];
            for(let i = 0; i < this.artists.length; i++){
                let artistGroup= this.artists.at(i) as FormGroup;
                artists.push(artistGroup.value.artist);
            }
            song.artists = artists;

            this.songService.editSong(song).subscribe({
                next: (response) => {
                    if(response.exception){
                        this.errorService.setError(response.exception.message);
                    }
                },
                error: (response) => this.errorService.setError(response.exception.message),
                complete: () => this.dialogRef.close()
            });
        }
    }
}