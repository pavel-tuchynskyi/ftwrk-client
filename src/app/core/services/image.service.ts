import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { UriBuilderService } from "src/app/core/services/uribuilder.service";
import { Image } from "../../dashboard/models/image/image";

@Injectable()
export class ImageService{
    private controller: string = "Image";
    public defaultRGB = {r: 180, g: 180, b: 180};
    
    constructor(private sanitizer: DomSanitizer, private http: HttpClient, private uriBuilder: UriBuilderService){}

    convertResponseToImage(image: Image){
        var url = `data:${image.imageType};base64,` + image.imageBytes;
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    public validateImage(file: File): boolean {
        let name = file.name;
        let fileSize = file.size;

        if(name == undefined || fileSize == undefined){
            return false;
        }

        return this.validateFileExtension(name) && this.validateFileSize(fileSize);
    }

    private validateFileExtension(name: string){
        const allowedExtension = [ '.png', '.jpeg', '.jpg'];

        let fileExtension = name.substring(name.lastIndexOf('.'), name.length);

        if(allowedExtension.includes(fileExtension)){
            return true;
        }
        else{
            return false;
        }
    }

    private validateFileSize(size: number): boolean{
        const maxSize = 1000000;
        
        if(size < maxSize){
            return true;
        }
        else{
            return false;
        }
    }

    getLogo(){
        var params = new HttpParams();
        params = params.set('name', 'Logo');
        return this.http.get(this.uriBuilder.createApiUri(this.controller, "GetPictureByName"), {params: params, responseType: 'blob'});
    }

    getAverageRGB(imgElement: any) {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext && canvas.getContext('2d');
        let rgb = {r: 0, g: 0, b: 0};
        
        let height = canvas.height = 250;
        let width = canvas.width = 250;
        
        context!.drawImage(imgElement, 0, 0);
        
        let data = context!.getImageData(0, 0, width, height);
        let blockSize = 5;
        let length = data.data.length;
        let count = 0;
        let i = -4;

        while ((i += blockSize * 4) < length) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i+1];
            rgb.b += data.data[i+2];
        }
        
        rgb.r = ~~(rgb.r/count);
        rgb.g = ~~(rgb.g/count);
        rgb.b = ~~(rgb.b/count);
        
        return rgb;
    }
}