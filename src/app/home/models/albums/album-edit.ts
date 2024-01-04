import { AlbumType } from "./album-type";

export class AlbumEdit{
    constructor(public id: string, public creatorId: string, public title: string, public year: string, public genres: string[],
        public albumType: AlbumType, public poster?: File){}
}