export type DashboardForgotPasswordInput = {
  email: string;
};

export type DashboardForgotPasswordErrors = {
  email?: string;
};

export type DashboardForgotPasswordResult = {
  isSuccess: boolean;
  message: string;
  errors: DashboardForgotPasswordErrors;
};
