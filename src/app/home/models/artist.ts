import { Image } from "src/app/dashboard/models/image/image";

export class Artist{
    constructor(public id: string, public artistName: string, public profilePicture: Image){}
}