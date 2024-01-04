import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { Item } from "src/app/shared/models/item";
import { UserAlbum } from "../../../models/albums/user-album";
import { AlbumService } from "../../../services/album.service";

@Component({
    selector: 'app-albums',
    templateUrl: 'albums.component.html',
    styleUrls: ['albums.component.scss'],
    providers: [AlbumService, ImageService]
})
export class AlbumsComponent implements OnInit{
    id!: string;
    albums: Item[] = [];
    params!: QueryParameters;
    totalPages: number = 1;

    constructor(private albumService: AlbumService, private route: ActivatedRoute, private errorService: ErrorHandlingService,
        private imageService: ImageService, private router: Router){}

    changePage(pageNumber: number): void {
        if(pageNumber <= this.totalPages){
            this.params.pageNumber = pageNumber;
            this.getAlbums();
        }
    }

    goBack(){
        this.router.navigate([`profile/${this.id}`])
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.id = params['id'];
            var map = new Map<string, string>();
            map.set("id", this.id);
        });
        var filterArr: FilterCondition[] = [];
        filterArr.push(new FilterCondition("CreatorId", FilterConditionType.Equal, this.id));
        var filter = new Filter(Operators.And, filterArr);
        this.params = new QueryParameters(filter, "Year desc", 1, 20);

        this.getAlbums();
    }

    getAlbums(){
        this.albumService.getAlbums(this.params).subscribe({
            next: (response) => {
                this.totalPages = response.data.totalPages;

                var albums = response.data.items.map(x =>{
                    var poster = this.imageService.convertResponseToImage(x.poster);
                    let title = `${x.year} - ${x.title}`;
                    return new Item(x.id, poster, title);
                });

                this.albums = this.albums.concat(albums);
            },
            error: (response) => this.errorService.setError(response.error.exception.message)
        });
    }

    goToAlbum(item: Item){
        this.router.navigate([`albums/${item.id}`]);
    }
}