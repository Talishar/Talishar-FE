export interface MatchResultWebhookRequest {
  webhookUrl: string;
}

export interface MatchResultWebhookResponse {
  success: boolean;
  message: string;
}
