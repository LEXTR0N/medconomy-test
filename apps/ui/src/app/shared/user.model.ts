// apps/ui/src/app/shared/user.model.ts
export interface Company {
  id: string;
  name: string;
  industry: string | null;
  address: string | null;
}

export interface User {
  id: string;
  name: string;
  position: string | null;
  email: string | null;
  address: string | null;
  company?: Company;
}