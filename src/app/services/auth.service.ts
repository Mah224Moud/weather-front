import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { UserInfo } from "../models/userInfo";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private userSubject: BehaviorSubject<UserInfo | null> =
    new BehaviorSubject<UserInfo | null>(this.getUserFromLocalStorage());
  public user$: Observable<UserInfo | null> = this.userSubject.asObservable();

  constructor() {}

  private getUserFromLocalStorage(): UserInfo | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  login(user: UserInfo): void {
    localStorage.setItem("user", JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem("user");
    this.userSubject.next(null);
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem("user");
  }
}
