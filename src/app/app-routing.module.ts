import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './login/login.component';
import { FileComponent } from './pages/file/file.component';
import { UserComponent } from './pages/user/user.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuardService } from './service/auth.gaurd.service';
const routes: Routes = [
  {
    path:'',
    component:LoginComponent,
  },
  {
    path:'',
    component:MainLayoutComponent,
    canActivate : [AuthGuardService],
    children:[
      {
        path:'file',
        component:FileComponent
      },
      {
        path: 'user',
        component:UserComponent
      },
      {
        path:'dashboard',
        component:DashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
