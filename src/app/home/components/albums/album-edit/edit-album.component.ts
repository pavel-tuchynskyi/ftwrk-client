import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AccountService } from "src/app/core/services/account.service";
import { AlbumDetails } from "src/app/home/models/albums/album-details";
import { AlbumEdit } from "src/app/home/models/albums/album-edit";
import { AlbumType } from "src/app/home/models/albums/album-type";
import { AlbumService } from "src/app/home/services/album.service";

@Component({
    selector: 'app-album-edit',
    templateUrl: 'edit-album.component.html',
    styleUrls: ['edit-album.component.scss'],
    providers: [AlbumService, AccountService]
})
export class EditAlbumComponent implements OnInit{
    album: AlbumDetails;
    editForm!: FormGroup;
    albumTypeKeys: (AlbumType)[];
    hasChange!: boolean;
    newPoster!: File;
    localUrl!: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: AlbumDetails, public dialogRef: MatDialogRef<AlbumDetails>,
    private albumService: AlbumService){
        this.album = data;
        this.albumTypeKeys = Object.values(AlbumType).filter(x => typeof x === 'number') as AlbumType[];
    }

    albumTypeMapping: Record<AlbumType, string> = {
        [AlbumType.Album]: "Album",
        [AlbumType.EP_Single]: "EP & Single",
        [AlbumType.Compilation]: "Compilation"
    };

    ngOnInit(): void {
        this.editForm = new FormGroup({
            title: new FormControl('', [Validators.nullValidator, Validators.required]),
            year: new FormControl('', [Validators.required, Validators.min(1900)]),
            albumType: new FormControl(AlbumType, [Validators.required]),
            genres: new FormArray([])
        });

        this.patchEditForm();
        this.onCreateGroupFormValueChange();
    }

    get genres(){
        return this.editForm.get('genres') as FormArray;
    }

    onCreateGroupFormValueChange(){
        const initialValue = this.editForm.value
        this.editForm.valueChanges.subscribe(value => {
          this.hasChange = Object.keys(initialValue).some(key => this.editForm.value[key] != initialValue[key])
        });
    }

    patchEditForm(){
        this.album.genres.forEach(x => {
            let fg = new FormGroup({
                genre: new FormControl(x, [Validators.required])
            });

            let genresArray = this.editForm.get('genres') as FormArray;
            genresArray.push(fg);
        });

        this.editForm.patchValue({title: this.album?.title});
        this.editForm.patchValue({year: this.album?.year});
        this.editForm.patchValue({albumType: this.album?.albumType});
    }

    addGenre(){
        this.genres.push(this.createGenresFromGroup());
    }

    removeGenre(index: number){
        this.genres.removeAt(index);
    }

    createGenresFromGroup(){
        return new FormGroup({
            genre: new FormControl('', [Validators.required])
        })
    }

    uploadImage(event: Event){
        const target = event.target as HTMLInputElement;
        var file = (target.files as FileList)[0];
        this.newPoster = file;
        this.getPreviewImage(this.newPoster);
        this.hasChange = true;
    }

    getPreviewImage(file: File){
        var reader = new FileReader();
        reader.onload = (event: any) => {
            this.localUrl = event.target.result;
        }
        reader.readAsDataURL(file);
    }

    submit(){
        if(this.hasChange){
            let albumEdit = this.editForm.value as AlbumEdit;
            let genresForm = this.editForm.value.genres as FormArray;
            let genres = [];
            for(let i = 0; i < genresForm.length; i++){
                let genreItem = genresForm.at(i) as any;
                genres.push(genreItem.genre as string);
            }
            albumEdit.genres = genres;
            albumEdit.id = this.album.id;
            albumEdit.creatorId = this.album.creatorId;

            if(this.newPoster){
                albumEdit.poster = this.newPoster;
            }

            this.albumService.editAlbum(albumEdit).subscribe({
                error: (response) => this.close(),
                complete: () => {
                    this.close();
                }
            });
        }
    }

    close(){
        this.dialogRef.close();
    }
}