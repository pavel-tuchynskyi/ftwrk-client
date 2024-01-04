import { Image } from "src/app/dashboard/models/image/image";

export class Playlist{
    constructor(public id: string, public title: string, public poster: any, public isCustom: boolean){}
}