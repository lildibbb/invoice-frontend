export enum GlobalRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
}

export enum MembershipRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export type AppRole = GlobalRole | MembershipRole;
