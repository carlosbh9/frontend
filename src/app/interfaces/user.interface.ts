export interface UserPayload {
    id: string;
    username: string;
    email: string;
    role: string; // O `role: string` si es solo un rol
  }


  export interface User{
    _id: string;
    username: string;
    name: string;
    role: string; // O `role: string` si es solo un rol
  }