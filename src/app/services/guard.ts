import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * CanActivate hook for guarding routes. If the user is logged in, the guard
   * allows the navigation to the route. Otherwise, the guard redirects the user
   * to the login page and prevents the navigation.
   *
   * @param next The ActivatedRouteSnapshot of the route being navigated to.
   * @param state The RouterStateSnapshot of the route being navigated to.
   * @returns Whether the navigation is allowed.
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
