import { AlbumType } from "./album-type";
import { Song } from "../songs/song";

export class AlbumDetails{
    constructor(public id: string, public creatorId: string, public creatorName: string, public genres: string[], public title: string,
        public year: number, public albumType: AlbumType, public poster: any, public songs: Song[]){}
}