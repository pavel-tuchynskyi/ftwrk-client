import { AlbumType } from "./album-type";

export class AlbumCreate{
    constructor(public title: string, public year: string, public genres: string[], public albumType: AlbumType,
        public poster: File){}
}