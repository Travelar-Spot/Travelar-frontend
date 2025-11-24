import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  LogOut,
  CalendarDays,
  CalendarCog,
  House,
  Plus,
  MapPinHouse,
  Search,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const Header: React.FC = () => {
  const {
    user,
    logout,
    isAuthenticated,
    isProprietario,
    temImoveis,
    updateUserData,
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await api.get(`/usuarios/${user.id}`);
          updateUserData(response.data);
        } catch (error) {
          console.error(
            "Erro ao sincronizar dados do usuário no Header",
            error,
          );
        }
      }
    };

    fetchLatestUserData();
  }, [isAuthenticated, user?.id, updateUserData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPinHouse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Travelar</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/buscar"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              <Search className="w-4 h-4" />
              <span>Explorar</span>
            </Link>

            {isAuthenticated && isProprietario && (
              <>
                {temImoveis ? (
                  <Link
                    to="/meus-imoveis"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    <House className="w-4 h-4" />
                    <span>Meus Imóveis</span>
                  </Link>
                ) : (
                  <Link
                    to="/gerenciar-imovel/novo"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Anunciar Imóvel</span>
                  </Link>
                )}
              </>
            )}
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/cadastro"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Cadastre-se
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  data-testid="user-menu-button"
                  ref={buttonRef}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-4 text-gray-700 group transition-colors duration-200"
                >
                  <img
                    src={
                      user?.foto ||
                      "https://img.icons8.com/?size=100&id=fUUEbUbXhzOA&format=png&color=000000"
                    }
                    alt={user?.nome || "Usuário"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{user?.nome}</span>
                  <Menu className="w-7 h-7 group-hover:text-blue-600 transition-colors" />
                </button>

                {isUserMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border z-50"
                  >
                    {!isProprietario ? (
                      <>
                        <Link
                          to="/gerenciar-imovel/novo"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Plus className="w-4 h-4 mr-3" />
                          Torne-se um anfitrião
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <Link
                          data-testid="nav-minhas-viagens"
                          to="/minhas-viagens"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <CalendarDays className="w-4 h-4 mr-3" />
                          Minhas Viagens
                        </Link>
                        <Link
                          data-testid="profile-link"
                          to="/meu-perfil"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Meu Perfil
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          data-testid="nav-reservas-anfitriao"
                          to="/reservas-anfitriao"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <CalendarCog className="w-4 h-4 mr-3" />
                          Gerenciar Reservas
                        </Link>
                        <Link
                          to="/gerenciar-imovel/novo"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Plus className="w-4 h-4 mr-3" />
                          Anunciar Imóvel
                        </Link>
                        <Link
                          to="/meus-imoveis"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <House className="w-4 h-4 mr-3" />
                          Meus Imóveis
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <Link
                          data-testid="nav-minhas-viagens"
                          to="/minhas-viagens"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <CalendarDays className="w-4 h-4 mr-3" />
                          Minhas Viagens
                        </Link>
                        <Link
                          data-testid="profile-link"
                          to="/meu-perfil"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Meu Perfil
                        </Link>
                      </>
                    )}

                    <hr className="my-1 border-gray-100" />
                    <button
                      data-testid="logout-button"
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-600" />
                      <span className="text-red-600">Sair</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
