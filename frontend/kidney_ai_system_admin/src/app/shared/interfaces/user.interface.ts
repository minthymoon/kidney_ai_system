export interface UserI {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: number;

  [key: string]: any;
}
