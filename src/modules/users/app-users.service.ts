import {
  createCustomerUser,
  createCustomerUserWithIdentity,
  findUserByEmail,
  findUserById,
  getCustomerProfileByUserId,
  updateCustomerProfile,
} from "./app-users.repo";
import {
  createStaffUserProfile,
  getStaffProfileByUserId,
  getStaffWithRoleByUserId,
  listStaffUsers,
  setStaffActiveStatus,
  updateStaffRole,
} from "./staff-users.repo";
import { listPermissionsForRole, listRoles, userHasPermission } from "./app-rbac.repo";

export {
  findUserById,
  findUserByEmail,
  createCustomerUser,
  createCustomerUserWithIdentity,
  getCustomerProfileByUserId,
  updateCustomerProfile,
  getStaffProfileByUserId,
  getStaffWithRoleByUserId,
  listStaffUsers,
  createStaffUserProfile,
  updateStaffRole,
  setStaffActiveStatus,
  listRoles,
  listPermissionsForRole,
  userHasPermission,
};
