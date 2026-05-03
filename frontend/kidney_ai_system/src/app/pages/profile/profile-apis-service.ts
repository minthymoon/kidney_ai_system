import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { UserProfile } from './interfaces/user-profile.interface';
import { UpdateUserProfileDto } from './dtos/update-profile.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileApisService {
  private readonly apis = inject(Apis);

  getLoggedInUser() {
    return this.apis.get<UserProfile>(`doctors/profile`);
  }

  updateLoggedInUser(updateUserProfile: UpdateUserProfileDto) {
    return this.apis.patch<UserProfile>(`doctors/profile`, updateUserProfile);
  }
}
