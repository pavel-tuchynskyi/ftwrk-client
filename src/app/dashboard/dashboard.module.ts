import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "../app-routing.module";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { ProfileNavComponent } from "./components/profile-nav/profile-nav.component";
import { EditProfileComponent } from "./components/edit-profile/edit-profile.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { PlayerComponent } from "./components/player/player.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {MatListModule} from '@angular/material/list';
import {MatSliderModule} from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import { LeftMenuComponent } from "./components/left-menu/left-menu.component";


@NgModule({
    declarations: [
        UserProfileComponent,
        ProfileNavComponent,
        EditProfileComponent,
        NavbarComponent,
        SettingsComponent,
        PlayerComponent,
        LeftMenuComponent,
    ],
    imports: [
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        DashboardRoutingModule,
        MatButtonModule,
        MatListModule,
        MatSliderModule,
        MatIconModule,
        MatToolbarModule,
        MatCardModule,
        MatMenuModule
    ],
    exports: [
        UserProfileComponent,
        ProfileNavComponent,
        EditProfileComponent,
        NavbarComponent,
        SettingsComponent,
        PlayerComponent,
        LeftMenuComponent
    ]
})
export class DashboardModule {}