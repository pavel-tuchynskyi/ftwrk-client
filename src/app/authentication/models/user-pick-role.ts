import { UserToken } from "./user-token";

export class UserPickRole{
    constructor(public token: UserToken, public roleName: string){}
}