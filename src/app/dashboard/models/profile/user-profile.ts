import { Image } from "../image/image";

export class UserProfile{
    constructor(public id: string, public userName: string, public fullName: string, public country: string, public age: number,
        public email: string, public emailConfirmed: boolean, public profilePicture: Image, public backgroundPicture: Image){}
}