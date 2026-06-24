export type CustomerSignupFormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
};

export type CustomerSignupResult = {
  isSuccess: boolean;
  message: string;
  errors: CustomerSignupFormErrors;
};
