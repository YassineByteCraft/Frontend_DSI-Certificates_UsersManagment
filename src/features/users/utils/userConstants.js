export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
};

export const ROLE_OPTIONS = Object.entries(USER_ROLES).map(([key, value]) => ({
  value,
  label: key.replace('_', ' '),
}));

export const STATUS_OPTIONS = Object.entries(USER_STATUSES).map(([key, value]) => ({
  value,
  label: key,
}));