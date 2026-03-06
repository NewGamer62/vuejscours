export interface User {
  id: number
  email: string
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  email: string
  password: string
  username: string
}
