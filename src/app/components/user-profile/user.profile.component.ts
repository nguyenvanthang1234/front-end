import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { UserResponse } from '../../responses/user/user.response';
import { UpdateUserDTO } from '../../dtos/user/update.user.dto';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'user-profile',
  templateUrl: './user.profile.component.html',
  styleUrls: ['./user.profile.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,   
  ],
})
export class UserProfileComponent implements OnInit {
  userResponse?: UserResponse;
  userProfileForm: FormGroup;
  token: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private tokenService: TokenService,
  ) {        
    this.userProfileForm = this.formBuilder.group({
      fullname: [''],     
      address: ['', [Validators.minLength(3)]],       
      password: ['', [Validators.minLength(3)]], 
      retype_password: ['', [Validators.minLength(3)]], 
      date_of_birth: ['', [Validators.required]],      
    }, {
      validators: this.passwordMatchValidator // Custom validator function for password match
    });
  }
  
  // ngOnInit(): void {  
  //   this.token = this.tokenService.getToken();
  //   this.userService.getUserDetail(this.token).subscribe({
  //     next: (response: any) => {
  //       try {
  //         let dateOfBirth: Date | null = null;
  //         if (response.date_of_birth) {
  //           dateOfBirth = new Date(response.date_of_birth);
  //           if (isNaN(dateOfBirth.getTime())) {
  //             throw new Error('Ngày sinh không hợp lệ trong phản hồi.');
  //           }
  //         }
          
  //         this.userResponse = {
  //           ...response,
  //           date_of_birth: dateOfBirth,
  //         };

  //         if (this.userResponse?.date_of_birth) {
  //           this.userProfileForm.patchValue({
  //             fullname: this.userResponse.fullname ?? '',
  //             address: this.userResponse.address ?? '',
  //             // Format ngày sinh từ đối tượng Date sang chuỗi yyyy-MM-dd
  //             date_of_birth: this.userResponse.date_of_birth.toISOString().substring(0, 10),
  //           });
  //           console.log('Định dạng năm sinh:', this.userResponse.date_of_birth.toISOString().substring(0, 10));
  //         } else {
  //           console.error('Ngày sinh không hợp lệ hoặc không được cung cấp trong phản hồi.');
  //         }

  //         this.userService.saveUserResponseToLocalStorage(this.userResponse);         
  //       } catch (error) {
  //         console.error('Lỗi khi xử lý ngày sinh:', error);
  //       }
  //     },
  //     complete: () => {},
  //     error: (error: HttpErrorResponse) => {
  //       console.error('Lỗi khi lấy thông tin người dùng:', error?.error?.message ?? '');
  //     }
  //   });
  // }
  ngOnInit(): void {  
    this.token = this.tokenService.getToken();
    this.userService.getUserDetail(this.token).subscribe({
      next: (response: any) => {
        try {
          let dateOfBirth: Date | null = null;
          if (response.date_of_birth) {
            dateOfBirth = new Date(response.date_of_birth);
            if (isNaN(dateOfBirth.getTime())) {
              throw new Error('Ngày sinh không hợp lệ trong phản hồi.');
            }
          }
          
          this.userResponse = {
            ...response,
            date_of_birth: dateOfBirth,
          };

          if (this.userResponse?.date_of_birth) {
            this.userProfileForm.patchValue({
              fullname: this.userResponse.fullname ?? '',
              address: this.userResponse.address ?? '',
              date_of_birth: this.userResponse.date_of_birth.toISOString().substring(0, 10),
            });
            console.log('Định dạng năm sinh:', this.userResponse.date_of_birth.toISOString().substring(0, 10));
          } else {
            console.error('Ngày sinh không hợp lệ hoặc không được cung cấp trong phản hồi.');
          }

          this.userService.saveUserResponseToLocalStorage(this.userResponse);         
        } catch (error) {
          console.error('Lỗi khi xử lý ngày sinh:', error);
        }
      },
      complete: () => {},
      error: (error: HttpErrorResponse) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error?.error?.message ?? '');
      }
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const retypedPassword = formGroup.get('retype_password')?.value;
      if (password !== retypedPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  save(): void {
    if (this.userProfileForm.valid) {
      const updateUserDTO: UpdateUserDTO = {
        fullname: this.userProfileForm.get('fullname')?.value,
        address: this.userProfileForm.get('address')?.value,
        password: this.userProfileForm.get('password')?.value,
        retype_password: this.userProfileForm.get('retype_password')?.value,
        date_of_birth: this.userProfileForm.get('date_of_birth')?.value
      };
  
      this.userService.updateUserDetail(this.token, updateUserDTO)
        .subscribe({
          next: (response: any) => {
            this.userService.removeUserFromLocalStorage();
            this.tokenService.removeToken();
            this.router.navigate(['/login']);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Lỗi khi cập nhật thông tin người dùng:', error?.error?.message ?? '');
          } 
        });
    } else {
      if (this.userProfileForm.hasError('passwordMismatch')) {        
        console.error('Mật khẩu và mật khẩu gõ lại chưa chính xác');
      }
    }
  }    
}
