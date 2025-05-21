import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  sub: string; 
}

export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.sub; 
  } catch {
    return null;
  }
};
