import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApisService {
  private readonly apis = inject(Apis);

  login(loginDto: LoginDto) {
    return this.apis.post<{ access_token: string }>('login', loginDto);
  }

  signup(signupDto: SignupDto) {
    return this.apis.post<{ access_token: string }>('signup', signupDto);
  }
}
