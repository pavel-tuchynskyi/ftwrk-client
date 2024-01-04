import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../core/services/auth-guard.service";
import { AddAlbumComponent } from "./components/albums/album-add/add-album.component";
import { AlbumDetailsComponent } from "./components/albums/album-details/album-details.component";
import { AlbumsComponent } from "./components/albums/album-list/albums.component";
import { HeaderComponent } from "./components/header/header.component";
import { HomepageComponent } from "./components/homepage/homepage.component";
import { PlaylistCreateComponent } from "./components/playlists/playlist-create/playlist-create.component";
import { PlaylistDetailsComponent } from "./components/playlists/playlist-details/playlist-details.component";
import { PlaylistFavoritesComponent } from "./components/playlists/playlist-favorites/playlist-favorites.component";
import { PlaylistsComponent } from "./components/playlists/playlist-list/playlists.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { SearchComponent } from "./components/search/search.component";

const routes: Routes = [
    { path: "", component: HeaderComponent, canActivate: [AuthGuard], children: [
        { path: "", component: HomepageComponent, canActivate: [AuthGuard] },
        { path: "profile/:id", component: ProfileComponent, canActivate: [AuthGuard]},
        { path: "profile/:id/albums", component: AlbumsComponent, canActivate: [AuthGuard] },
        { path: "albums/:albumId", component: AlbumDetailsComponent, canActivate: [AuthGuard] },
        { path: "album-create", component: AddAlbumComponent, canActivate: [AuthGuard] },
        { path: "profile/:id/playlists", component: PlaylistsComponent, canActivate: [AuthGuard] },
        { path: "playlists/:playlistsId", component: PlaylistDetailsComponent, canActivate: [AuthGuard] },
        { path: "playlist-create", component: PlaylistCreateComponent, canActivate: [AuthGuard] },
        { path: "favorites", component: PlaylistFavoritesComponent, canActivate: [AuthGuard] },
        { path: "search", component: SearchComponent, canActivate: [AuthGuard] }
    ] }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
    ],
    providers: [
        AuthGuard
    ],
    exports: [RouterModule]
})
export class HomeRoutingModule {}