import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { ItemGroupComponent } from "./components/item-group/item-group.component";
import { ModalDelete } from "./components/modal-delete/modal-delete.component";

@NgModule({
    declarations: [
        ItemGroupComponent,
        ModalDelete
    ],
    imports: [
        HttpClientModule,
        HttpClientModule,
        CommonModule,
        InfiniteScrollModule,
        MatDialogModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatMenuModule,
        DragDropModule
    ],
    exports: [ItemGroupComponent, ModalDelete]
})
export class SharedModule {}