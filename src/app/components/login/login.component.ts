import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { LoginDTO } from '../../dtos/user/login.dto';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { RoleService } from '../../services/role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoginResponse } from '../../responses/user/login.response';
import { Role } from '../../models/role';
import { UserResponse } from '../../responses/user/user.response';
import { CartService } from '../../services/cart.service';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../responses/api.response';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule
  ]
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('loginForm') loginForm!: NgForm;

  phoneNumber: string = '';
  password: string = '';
  showPassword: boolean = false;
  roles: Role[] = [];
  rememberMe: boolean = true;
  selectedRole: Role | undefined;
  userResponse?: UserResponse;
    //Login user1
    // phoneNumber: string = '33445566';
    // password: string = '123456789';
  
    // //Login user2
    // phoneNumber: string = '0964896239';
    // password: string = '123456789';
  
  
    // //Login admin
    // phoneNumber: string = '11223344';
    // password: string = '11223344';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.roleService.getRoles().subscribe({
      next: (apiResponse: ApiResponse) => {
        const roles = apiResponse.data;
        this.roles = roles;
        this.selectedRole = roles.length > 0 ? roles[0] : undefined;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error?.error?.message ?? '');
      }
    });
  }

  ngAfterViewInit() {
    // Kiểm tra loginForm sau khi view đã được khởi tạo
    if (this.loginForm) {
      console.log('Login form is ready');
    }
  }

  onPhoneNumberChange() {
    console.log(`Phone typed: ${this.phoneNumber}`);
  }

  createAccount() {
    this.router.navigate(['/register']);
  }

  login() {
    const loginDTO: LoginDTO = {
      phone_number: this.phoneNumber,
      password: this.password,
      role_id: this.selectedRole?.id ?? 1
    };
    this.userService.login(loginDTO).subscribe({
      next: (apiResponse: ApiResponse) => {
        const { token } = apiResponse.data;
        if (this.rememberMe) {
          this.tokenService.setToken(token);
          this.userService.getUserDetail(token).subscribe({
            next: (apiResponse2: ApiResponse) => {
              this.userResponse = {
                ...apiResponse2.data,
                date_of_birth: new Date(apiResponse2.data.date_of_birth),
              };
              this.userService.saveUserResponseToLocalStorage(this.userResponse);
              if (this.userResponse?.role.name == 'admin') {
                this.router.navigate(['/admin']);
              } else if (this.userResponse?.role.name == 'user') {
                this.router.navigate(['/']);
              }
            },
            complete: () => {
              this.cartService.refreshCart();
            },
            error: (error: HttpErrorResponse) => {
              console.error(error?.error?.message ?? '');
            }
          });
        }
      },
      complete: () => { },
      error: (error: HttpErrorResponse) => {
        console.error(error?.error?.message ?? '');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
