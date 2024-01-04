import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { PagedList } from "src/app/core/models/paged-list";
import { QueryParameters } from "src/app/core/models/query-parameters";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { AlbumCreate } from "../models/albums/album-create";
import { AlbumDetails } from "../models/albums/album-details";
import { AlbumEdit } from "../models/albums/album-edit";
import { AlbumType } from "../models/albums/album-type";
import { UserAlbum } from "../models/albums/user-album";

@Injectable()
export class AlbumService{
    private controller: string = "Albums";

    constructor(private http: HttpClient, private uriBuilder: UriBuilderService){}

    getAlbums(params: QueryParameters){
        return this.http.post<HttpResponse<PagedList<UserAlbum[]>>>(this.uriBuilder.createApiUri(this.controller, "GetAlbums"), params);
    }

    getAlbum(id: string){
        return this.http.get<HttpResponse<AlbumDetails>>(this.uriBuilder.createApiUri(this.controller, "GetAlbumById/" + id));
    }

    getAlbumTypeName(type: AlbumType){
        switch(type){
            case AlbumType.Album: {
                return "Album";
            }
            case AlbumType.Compilation: {
                return "Compilation";
            }
            case AlbumType.EP_Single: {
                return "EP & Singles";
            }
            default: {
                return "Unknown";
            }
        }
    }

    editAlbum(album: AlbumEdit){
        var formData = new FormData();
        if(album.poster){
            formData.set('Poster', album.poster, album.poster.name);
        }
        formData.set('Id', album.id);
        formData.set('CreatorId', album.creatorId);
        formData.set('Title', album.title);
        formData.set('Year', album.year);

        for(let genre of album.genres){
            formData.append("Genres", genre);
        }

        formData.set("AlbumType", album.albumType.toString());

        return this.http.put(this.uriBuilder.createApiUri(this.controller, "UpdateAlbum"), formData);
    }

    addAlbum(album: AlbumCreate){
        var formData = new FormData();

        formData.set('Title', album.title);
        formData.set('Year', album.year);

        for(let genre of album.genres){
            formData.append("Genres", genre);
        }

        formData.set("AlbumType", album.albumType.toString());
        formData.set('Poster', album.poster, album.poster.name);

        return this.http.post<HttpResponse<string>>(this.uriBuilder.createApiUri(this.controller, "AddAlbum"), formData);
    }

    deleteAlbum(id: string){
        return this.http.delete(this.uriBuilder.createApiUri(this.controller, `DeleteAlbum/${id}`));
    }
}