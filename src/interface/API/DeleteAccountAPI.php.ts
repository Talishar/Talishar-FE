export interface DeleteAccountAPIRequest {
  confirmationUsername: string;
}

export interface DeleteAccountAPIResponse {
  success: boolean;
  message: string;
}
