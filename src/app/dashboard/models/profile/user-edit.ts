import { Image } from "../image/image";

export class UserEdit{
    constructor(public userName: string, public fullName: string, public email: string, 
        public country: string, public age: number, public isArtist: boolean, public profilePicture?: File, public backgroundPicture?: File){}
}