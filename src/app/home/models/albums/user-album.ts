import { AlbumType } from "./album-type";

export class UserAlbum{
    constructor(public id: string, public title: string, public year: number, public albumType: AlbumType, public poster: any){}
}