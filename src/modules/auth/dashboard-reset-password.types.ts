export type DashboardResetPasswordInput = {
  password: string;
  confirmPassword: string;
};

export type DashboardResetPasswordErrors = {
  password?: string;
  confirmPassword?: string;
};

export type DashboardResetPasswordResult = {
  isSuccess: boolean;
  message: string;
  errors: DashboardResetPasswordErrors;
};
