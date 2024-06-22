// import { Component, OnInit } from '@angular/core';
// import { UserService } from '../../services/user.service';

// import { ActivatedRoute, Router } from '@angular/router';
// import { TokenService } from '../../services/token.service';
// import { UserResponse } from '../../responses/user/user.response';

// import { CommonModule } from '@angular/common';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { RouterModule } from '@angular/router';  

// @Component({
//   selector: 'app-header',
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.scss'],
//   standalone: true,
//   imports: [    
//     CommonModule,
//     NgbModule,
//     RouterModule
//   ]
// })
// export class HeaderComponent implements OnInit{
//   userResponse?:UserResponse | null;
//   isPopoverOpen = false;
//   activeNavItem: number = 0;

//   constructor(
//     private userService: UserService,       
//     private tokenService: TokenService,    
//     private router: Router,
//   ) {
    
//    }
//   ngOnInit() {
//     this.userResponse = this.userService.getUserResponseFromLocalStorage();    
//   }  

//   togglePopover(event: Event): void {
//     event.preventDefault();
//     this.isPopoverOpen = !this.isPopoverOpen;
//   }

//   handleItemClick(index: number): void {
//     //console.error(`Clicked on "${index}"`);
//     if(index === 0) {
      
//       this.router.navigate(['/user-profile']);                      
//     } else if (index === 2) {
//       this.userService.removeUserFromLocalStorage();
//       this.tokenService.removeToken();
//       this.userResponse = this.userService.getUserResponseFromLocalStorage();    
//     }
//     this.isPopoverOpen = false; // Close the popover after clicking an item    
//   }

  
//   setActiveNavItem(index: number) {    
//     this.activeNavItem = index;
//     //console.error(this.activeNavItem);
//   }  
// }
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { UserResponse } from '../../responses/user/user.response';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    RouterModule
  ]
})
export class HeaderComponent implements OnInit {
  userResponse?: UserResponse | null;
  isPopoverOpen = false;
  activeNavItem: number = 0;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadUser();
  }

  private loadUser() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    if (!this.userResponse) {
      this.userResponse = null;
    }
  }

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  handleItemClick(index: number): void {
    if (index === 0) {
      this.router.navigate(['/user-profile']);
    } else if (index === 2) {
      this.userService.removeUserFromLocalStorage();
      this.tokenService.removeToken();
      this.userResponse = null;
    }
    this.isPopoverOpen = false;
  }

  setActiveNavItem(index: number) {
    this.activeNavItem = index;
  }
}
