import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class UriBuilderService {
    private apiUri: string = "https://localhost:7244";

    createApiUri(controller: string, action?: string, queryParams?: Map<string, string>){
        var uri = action ? `${this.apiUri}/api/${controller}/${action}` : `${this.apiUri}/api/${controller}`;
        if(queryParams){
            uri += '?'
            queryParams.forEach((value, key) => {
                uri += `${key}=${value}&`;
            });
            uri = uri.slice(0, -1); 
        }
        return uri;
    }


}