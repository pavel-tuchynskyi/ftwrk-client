import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../core/services/auth-guard.service";
import { EditProfileComponent } from "./components/edit-profile/edit-profile.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";

const routes: Routes = [
    { path: "", component: SettingsComponent, canActivate: [AuthGuard], children: [
        { path: "profile-overview", component: UserProfileComponent, canActivate: [AuthGuard] },
        { path: "edit-profile", component: EditProfileComponent, canActivate: [AuthGuard] },
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
export class DashboardRoutingModule {}