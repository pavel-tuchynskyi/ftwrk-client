import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { DashboardModule } from "../dashboard/dashboard.module";
import { AlbumDetailsComponent } from "./components/albums/album-details/album-details.component";
import { AlbumsComponent } from "./components/albums/album-list/albums.component";
import { EditAlbumComponent } from "./components/albums/album-edit/edit-album.component";
import { HeaderComponent } from "./components/header/header.component";
import { HomepageComponent } from "./components/homepage/homepage.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { HomeRoutingModule } from "./home-routing.module";
import { MatDialogModule } from "@angular/material/dialog";
import { AddAlbumComponent } from "./components/albums/album-add/add-album.component";
import { MatSelectModule } from "@angular/material/select";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatMenuModule } from '@angular/material/menu';
import { SongAddComponent } from "./components/songs/song-add/song-add.component";
import { SongEditComponent } from "./components/songs/song-edit/song-edit.component";
import { PlaylistCreateComponent } from "./components/playlists/playlist-create/playlist-create.component";
import { PlaylistsComponent } from "./components/playlists/playlist-list/playlists.component";
import { PlaylistDetailsComponent } from "./components/playlists/playlist-details/playlist-details.component";
import { PlaylistEditComponent } from "./components/playlists/playlist-edit/playlist-edit.component";
import {DragDropModule} from '@angular/cdk/drag-drop';
import { PlaylistFavoritesComponent } from "./components/playlists/playlist-favorites/playlist-favorites.component";
import { SearchComponent } from "./components/search/search.component";
import { SongListComponent } from "./components/songs/song-list/song-list.component";
import { SharedModule } from "../shared/shared.module";
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import { CoreModule } from "../core/core.module";
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';

@NgModule({
    declarations: [
        HeaderComponent,
        ProfileComponent,
        HomepageComponent,
        AlbumsComponent,
        AlbumDetailsComponent,
        EditAlbumComponent,
        AddAlbumComponent,
        SongAddComponent,
        SongEditComponent,
        PlaylistCreateComponent,
        PlaylistsComponent,
        PlaylistDetailsComponent,
        PlaylistEditComponent,
        PlaylistFavoritesComponent,
        SearchComponent,
        SongListComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        HomeRoutingModule,
        DashboardModule,
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        InfiniteScrollModule,
        MatDialogModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatMenuModule,
        DragDropModule,
        SharedModule,
        MatTableModule,
        MatSortModule,
        CoreModule,
        MatCardModule,
        MatToolbarModule
    ]
})
export class HomeModule {}