
import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RepositoryService } from "./repository.service";

@Injectable()

export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private service: RepositoryService) { }

    canActivate(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | UrlTree {
        if (!this.service.token()) {
            //alert('You are not allowed to view this page. You are redirected to login Page');

            this.router.navigate([""]);
            return false;
        }

        return true;
    }
}