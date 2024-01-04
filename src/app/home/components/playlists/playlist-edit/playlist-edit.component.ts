import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SafeUrl } from "@angular/platform-browser";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { PlaylistDetails } from "src/app/home/models/playlists/playlist-details";
import { PlaylistEdit } from "src/app/home/models/playlists/playlist-edit";
import { PlaylistService } from "src/app/home/services/playlist.service";

@Component({
    selector: 'app-playlist-edit',
    templateUrl: 'playlist-edit.component.html',
    styleUrls: ['playlist-edit.component.scss'],
    providers: [ImageService, PlaylistService]
})
export class PlaylistEditComponent implements OnInit{
    playlist: PlaylistDetails;
    poster!: SafeUrl;
    editForm!: FormGroup;
    newPoster!: File;
    localUrl!: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: PlaylistDetails, public dialogRef: MatDialogRef<PlaylistDetails>,
    private imageService: ImageService, private playlistService: PlaylistService, private errorService: ErrorHandlingService){
        this.playlist = data;
        if(data.poster){
            this.poster = this.imageService.convertResponseToImage(data.poster);
        }
        else{
            this.poster = '../assets/img/playlist.png';
        }
    }

    ngOnInit(): void {
        this.editForm = new FormGroup({
            title: new FormControl('', [Validators.required]),
            description: new FormControl('')
        });

        this.patchForm();
    }

    uploadImage(event: Event){
        const target = event.target as HTMLInputElement;
        var file = (target.files as FileList)[0];
        this.newPoster = file;
        this.getPreviewImage(this.newPoster);
    }

    getPreviewImage(file: File){
        var reader = new FileReader();
        reader.onload = (event: any) => {
            this.localUrl = event.target.result;
        }
        reader.readAsDataURL(file);
    }

    patchForm(){
        this.editForm.patchValue({title: this.playlist.title});
        this.editForm.patchValue({description: this.playlist.description});
    }

    submit(){
        let playlist = this.editForm.value as PlaylistEdit;
        playlist.id = this.playlist.id;
        playlist.ownerId = this.playlist.ownerId;
        playlist.poster = this.newPoster;

        this.playlistService.editPlaylist(playlist).subscribe({
            error: (response) => this.errorService.setError(response.error.exception.message),
            complete: () => this.close()
        });
    }

    close(){
        this.dialogRef.close();
    }
}