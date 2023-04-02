
export interface ResetPassword {
  selector: string;
  validator: string;
  password: string;
  passwordRepeat: string;
}

export interface ResetPasswordResponse {
  error?: string;
  message?: string;
}
