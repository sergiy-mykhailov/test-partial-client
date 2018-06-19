export interface Appraiser {
  id: string;
  name: string;
  address: string;
  mobile_phone_number: string;
  wired_phone_number: string;
  email_address: string;
}

export interface AppraiserInput {
  name?: string;
  address?: string;
  mobile_phone_number?: string;
  wired_phone_number?: string;
  email_address?: string;
}
