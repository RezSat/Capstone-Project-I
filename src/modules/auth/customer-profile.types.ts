export type CustomerProfileFormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  displayName?: string;
};

export type CustomerProfileResult = {
  isSuccess: boolean;
  message: string;
  errors: CustomerProfileFormErrors;
};
