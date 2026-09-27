import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('@EntreVersos:user');
    const token = localStorage.getItem('@EntreVersos:token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('@EntreVersos:user', JSON.stringify(userData));
    localStorage.setItem('@EntreVersos:token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@EntreVersos:user');
    localStorage.removeItem('@EntreVersos:token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}