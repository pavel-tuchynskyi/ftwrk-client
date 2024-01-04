import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { AlbumCreate } from "src/app/home/models/albums/album-create";
import { AlbumType } from "src/app/home/models/albums/album-type";
import { AlbumService } from "src/app/home/services/album.service";

@Component({
    selector: 'app-add-album',
    templateUrl: 'add-album.component.html',
    styleUrls: ['add-album.component.scss'],
    providers: [AlbumService]
})
export class AddAlbumComponent implements OnInit{
    createForm!: FormGroup;
    poster!: File;
    localUrl!: string;
    albumTypeKeys: (AlbumType)[];

    constructor(private albumService: AlbumService, private errorService: ErrorHandlingService, private router: Router){
        this.albumTypeKeys = Object.values(AlbumType).filter(x => typeof x === 'number') as AlbumType[];
    }

    ngOnInit(): void {
        this.createForm = new FormGroup({
            title: new FormControl('', [Validators.nullValidator, Validators.required]),
            year: new FormControl(2023, [Validators.required, Validators.min(1900)]),
            albumType: new FormControl(AlbumType.Album, [Validators.required]),
            genres: new FormArray([this.createGenresFromGroup()])
        });
    }

    albumTypeMapping: Record<AlbumType, string> = {
        [AlbumType.Album]: "Album",
        [AlbumType.EP_Single]: "EP & Single",
        [AlbumType.Compilation]: "Compilation"
    };

    get genres(){
        return this.createForm.get('genres') as FormArray;
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
        this.poster = file;
        this.getPreviewImage(this.poster);
    }

    getPreviewImage(file: File){
        var reader = new FileReader();
        reader.onload = (event: any) => {
            this.localUrl = event.target.result;
        }
        reader.readAsDataURL(file);
    }

    submit(){
        let albumCreate = this.createForm.value as AlbumCreate;
        let genresForm = this.createForm.value.genres as FormArray;
        let genres = [];
        for(let i = 0; i < genresForm.length; i++){
            let genreItem = genresForm.at(i) as any;
            genres.push(genreItem.genre as string);
        }
        albumCreate.genres = genres;
        albumCreate.poster = this.poster;

        this.albumService.addAlbum(albumCreate).subscribe({
            next: (response) => {
                if(response.exception){
                    this.errorService.setError(response.exception.message);
                }
                this.router.navigate([`albums/${response.data}`]);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        })
    }
}