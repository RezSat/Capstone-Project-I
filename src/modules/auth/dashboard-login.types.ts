export type DashboardLoginInput = {
  email: string;
  password: string;
};

export type DashboardLoginFormErrors = {
  email?: string;
  password?: string;
};

export type DashboardLoginResult = {
  isSuccess: boolean;
  message: string;
  errors: DashboardLoginFormErrors;
};
