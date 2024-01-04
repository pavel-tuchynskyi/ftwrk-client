import { HttpResponseException } from "./http-response-exception";

export class HttpResponse<T>{
    constructor(public statusCode: number, public data: T, public exception: HttpResponseException){}
}