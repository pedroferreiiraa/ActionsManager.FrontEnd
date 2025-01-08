// authUtils.ts

// Obtém o token armazenado no localStorage
export const getToken = (): string | null => {
    return localStorage.getItem('token');
  };
  
  export const logout = (): void => {
    localStorage.removeItem('token'); // Substitua 'token' pela chave que você está usando, se for diferente
  };
// eslint-disable-next-line
  const decodeJWT = (token: string): Record<string, any> | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload); // Decodifica a base64
      return JSON.parse(decoded); // Converte para objeto
    } catch (error) {
      console.error('Erro ao decodificar o JWT:', error);
      return null;
    }
  };
  
  export const getUserIdFromToken = (token: string): string | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
  
      const decoded = JSON.parse(jsonPayload);
      return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
    } catch {
      console.error('Invalid token');
      return null;
    }
  };

  // Obtém o papel do usuário a partir do token
  export const getRole = (): string | null => {
    const token = getToken();
    if (token) {
      const decodedToken = decodeJWT(token);
      return decodedToken
        ? decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        : null;
    }
    return null;
  };
  