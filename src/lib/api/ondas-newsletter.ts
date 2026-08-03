import { apiFetch } from "./config";

export interface OndasNewsletterSubscribeResponse {
  message: string;
}

export const ondasNewsletterApi = {
  subscribe: (email: string) =>
    apiFetch<OndasNewsletterSubscribeResponse>("/ondas-newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};
