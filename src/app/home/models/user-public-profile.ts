import { Image } from "src/app/dashboard/models/image/image";

export class UserPublicProfile{
    constructor(public id: string, public fullName: string, public profilePicture: Image, public backgroundPicture: Image){}
}