import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { PlaylistCreate } from "src/app/home/models/playlists/playlist-create";
import { PlaylistService } from "src/app/home/services/playlist.service";

@Component({
    selector: 'app-playlist-create',
    templateUrl: 'playlist-create.component.html',
    styleUrls: ['playlist-create.component.scss'],
    providers: [PlaylistService, ErrorHandlingService]
})
export class PlaylistCreateComponent{
    createPlaylistForm: FormGroup;
    poster!: File;
    posterUrl!: string;

    constructor(private playlistService: PlaylistService, private errorService: ErrorHandlingService, private router: Router){
        this.createPlaylistForm = new FormGroup({
            title: new FormControl('', [Validators.required]),
            description: new FormControl('')
        });
    }

    uploadImage(event: Event){
        const target = event.target as HTMLInputElement;
        var file = (target.files as FileList)[0];
        this.poster = file;
        this.getPreviewImage(this.poster);
    }

    getPreviewImage(file: File){
        var reader = new FileReader();
        reader.onload = (event: any) => {
            this.posterUrl = event.target.result;
        }
        reader.readAsDataURL(file);
    }

    submit(){
        let playlist = this.createPlaylistForm.value as PlaylistCreate;
        playlist.poster = this.poster;
        this.playlistService.createPlaylist(playlist).subscribe({
            next: (response) => {
                this.router.navigate([`playlists/${response.data}`]);
            },
            error: (response) => this.errorService.setError(response.exception.message)
        })
    }
}