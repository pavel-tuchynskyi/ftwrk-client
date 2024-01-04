import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";


@Component({
    selector: 'app-modal-delete',
    templateUrl: './modal-delete.component.html',
    styleUrls: ['./modal-delete.component.scss']
})
export class ModalDelete{
    title: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: string, public dialogRef: MatDialogRef<boolean>){
        this.title = data;
    }

    confirm(){
        this.dialogRef.close(true);
    }

    close(){
        this.dialogRef.close();
    }
}