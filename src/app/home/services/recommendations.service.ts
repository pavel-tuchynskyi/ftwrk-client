import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpResponse } from "src/app/core/models/http-response";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { UserAlbum } from "../models/albums/user-album";

@Injectable()
export class RecommendationService {
    private controller: string = 'Recommendations';

    constructor(private http: HttpClient, private uriBuilder: UriBuilderService){}

    getRecommendationAlbums(){
        return this.http.get<HttpResponse<UserAlbum[]>>(this.uriBuilder.createApiUri(this.controller, "GetUserRecommendations"));
    }
}