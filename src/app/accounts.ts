// describes the account data used for login and registration
export interface Accounts {
  id: string
  email: string
  password: string

  // the role controls which part of the application this account can open
  role: string
  createdAt: string
}
