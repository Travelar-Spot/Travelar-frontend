import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import api from "../lib/api";

interface User {
  id: number;
  role: "CLIENTE" | "PROPRIETARIO" | "AMBOS";
  nome: string;
  email?: string;
  telefone?: string;
  criadoEm?: string;
  foto?: string;
}

interface JwtPayload {
  sub: number;
  role: "CLIENTE" | "PROPRIETARIO" | "AMBOS";
  iat: number;
  exp: number;
}

interface RegisterData {
  nome: string;
  email: string;
  telefone: string;
  role: "CLIENTE" | "PROPRIETARIO" | "AMBOS";
  senha: string;
}

interface LoginResponse {
  accessToken: string;
}

interface ApiErrorResponse {
  message: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isProprietario: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  temImoveis: boolean;
  verificarImoveis: () => Promise<void>;
  updateUserData: (updatedData: Partial<User>) => void;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER_DETAILS: "user-details",
};

const ROLES = {
  PROPRIETARIO: "PROPRIETARIO",
  AMBOS: "AMBOS",
} as const;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message;
  }
  return error instanceof Error ? error.message : "Erro desconhecido";
};

const fetchUserDetails = async (userId: number): Promise<Partial<User>> => {
  try {
    const response = await api.get<User>(`/usuarios/${userId}`);
    return response.data || {};
  } catch (error) {
    console.warn(
      "Falha ao buscar detalhes do usuário:",
      getErrorMessage(error),
    );
    return {};
  }
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [temImoveis, setTemImoveis] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateUserData = useCallback((updatedData: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return null;
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem(STORAGE_KEYS.USER_DETAILS, JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const verificarImoveis = useCallback(async () => {
    const userDetailsString = localStorage.getItem(STORAGE_KEYS.USER_DETAILS);
    const currentUserDetails = userDetailsString
      ? JSON.parse(userDetailsString)
      : null;

    if (
      !currentUserDetails ||
      (currentUserDetails.role !== ROLES.PROPRIETARIO &&
        currentUserDetails.role !== ROLES.AMBOS)
    ) {
      setTemImoveis(false);
      return;
    }

    try {
      const response = await api.get("/imoveis");
      const imoveisDoUsuario = (response.data || []).filter(
        (imovel: { proprietario?: { id: number } }) =>
          imovel.proprietario?.id.toString() ===
          currentUserDetails.id.toString(),
      );
      setTemImoveis(imoveisDoUsuario.length > 0);
    } catch (error) {
      console.error("Erro ao verificar imóveis:", getErrorMessage(error));
      setTemImoveis(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTemImoveis(false);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DETAILS);
  }, []);

  const processLogin = useCallback(
    async (email: string, accessToken: string): Promise<void> => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      const decoded = jwtDecode<JwtPayload>(accessToken);

      const userDetailsFromApi = await fetchUserDetails(decoded.sub);

      const loggedUser: User = {
        id: decoded.sub,
        role: decoded.role,
        nome: userDetailsFromApi.nome || email.split("@")[0],
        email: userDetailsFromApi.email || email,
        telefone: userDetailsFromApi.telefone,
        criadoEm: userDetailsFromApi.criadoEm,
        foto: userDetailsFromApi.foto,
      };

      setUser(loggedUser);
      localStorage.setItem(
        STORAGE_KEYS.USER_DETAILS,
        JSON.stringify(loggedUser),
      );

      if (
        loggedUser.role === ROLES.PROPRIETARIO ||
        loggedUser.role === ROLES.AMBOS
      ) {
        await verificarImoveis();
      }
    },
    [verificarImoveis],
  );

  const login = useCallback(
    async (email: string, senha: string): Promise<boolean> => {
      try {
        const response = await authApi.post<LoginResponse>("/auth/login", {
          email,
          senha,
        });
        const { accessToken } = response.data;

        if (accessToken) {
          await processLogin(email, accessToken);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erro de login:", getErrorMessage(error));
        return false;
      }
    },
    [processLogin],
  );

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      await authApi.post("/auth/register", data);
      return true;
    } catch (error) {
      console.error("Erro de registro:", getErrorMessage(error));
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUserDetails = localStorage.getItem(STORAGE_KEYS.USER_DETAILS);

      if (token && storedUserDetails) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const isTokenValid = decoded.exp * 1000 > Date.now();

          if (isTokenValid) {
            const userDetails: User = JSON.parse(storedUserDetails);
            setUser({
              id: decoded.sub,
              role: decoded.role,
              nome: userDetails.nome || "Usuário",
              email: userDetails.email,
              telefone: userDetails.telefone,
              criadoEm: userDetails.criadoEm,
              foto: userDetails.foto,
            });

            if (
              userDetails.role === ROLES.PROPRIETARIO ||
              userDetails.role === ROLES.AMBOS
            ) {
              verificarImoveis();
            }
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout, verificarImoveis]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isProprietario:
        user?.role === ROLES.PROPRIETARIO || user?.role === ROLES.AMBOS,
      login,
      logout,
      register,
      temImoveis,
      verificarImoveis,
      updateUserData,
    }),
    [
      user,
      temImoveis,
      verificarImoveis,
      updateUserData,
      login,
      logout,
      register,
    ],
  );

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
