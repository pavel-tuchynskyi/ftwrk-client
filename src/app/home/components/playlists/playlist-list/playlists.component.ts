import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, FilterCondition, FilterConditionType, Operators, QueryParameters } from "src/app/core/models/query-parameters";
import { ErrorHandlingService } from "src/app/core/services/error-handling.service";
import { ImageService } from "src/app/core/services/image.service";
import { Item } from "src/app/shared/models/item";
import { PlaylistService } from "../../../services/playlist.service";

@Component({
    selector: 'app-playlists',
    templateUrl: 'playlists.component.html',
    styleUrls: ['playlists.component.scss'],
    providers: [PlaylistService, ImageService]
})
export class PlaylistsComponent implements OnInit{
    id!: string;
    playlists: Item[] = [];
    params!: QueryParameters;
    totalPages: number = 1;
    
    constructor(private playlistService: PlaylistService, private route: ActivatedRoute, private errorService: ErrorHandlingService,
        private imageService: ImageService, private router: Router){}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.id = params['id'];
        });
        var filterArr: FilterCondition[] = [];
        filterArr.push(new FilterCondition("OwnerId", FilterConditionType.Equal, this.id));
        var filter = new Filter(Operators.And, filterArr);
        this.params = new QueryParameters(filter, "Title desc", 1, 20);

        this.getPlaylists();
    }

    changePage(pageNumber: number): void {
        if(pageNumber <= this.totalPages){
            this.params.pageNumber = pageNumber;
            this.getPlaylists();
        }
    }

    getPlaylists(){
        this.playlistService.getPlaylists(this.params).subscribe({
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
        });
    }

    goBack(){
        this.router.navigate([`profile/${this.id}`])
    }

    goToPlaylist(item: Item){
        this.router.navigate([`playlists/${item.id}`]);
    }
}