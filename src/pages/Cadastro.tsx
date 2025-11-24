import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  MapPinHouse,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    role: "CLIENTE",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        role: formData.role as "CLIENTE" | "PROPRIETARIO",
        senha: formData.senha,
      });

      if (success) {
        toast.success("Conta criada com sucesso!");
        navigate("/login");
      } else {
        toast.error(
          "Erro ao criar conta. Verifique os dados ou tente outro email.",
        );
      }
    } catch (error: unknown) {
      let errorMessage = "Erro inesperado ao criar conta.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPinHouse className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Travelar</span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            entre na sua conta existente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  data-testid="register-name"
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  data-testid="register-email"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este e-mail não poderá ser alterado após o cadastro.
              </p>
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700"
              >
                Telefone
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  data-testid="register-phone"
                  id="telefone"
                  name="telefone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <hr className="my-3 border-gray-300" />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Como você quer usar o Travelar?
              </label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center">
                  <input
                    data-testid="role-cliente"
                    id="cliente"
                    name="role"
                    type="radio"
                    value="CLIENTE"
                    checked={formData.role === "CLIENTE"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="cliente"
                    className="ml-3 block text-sm text-gray-700"
                  >
                    <span className="font-medium">Quero apenas viajar</span>
                    <p className="text-gray-500 text-xs">
                      Buscar e reservar hospedagens
                    </p>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    data-testid="role-proprietario"
                    id="proprietario"
                    name="role"
                    type="radio"
                    value="PROPRIETARIO"
                    checked={formData.role === "PROPRIETARIO"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="proprietario"
                    className="ml-3 block text-sm text-gray-700"
                  >
                    <span className="font-medium">
                      Quero anunciar meu imóvel
                    </span>
                    <p className="text-gray-500 text-xs">
                      Hospedar viajantes e ganhar dinheiro
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  data-testid="register-password"
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  data-testid="register-confirm-password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                data-testid="register-terms"
                id="termos"
                name="termos"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="termos"
                className="ml-2 block text-sm text-gray-900"
              >
                Concordo com os{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Política de Privacidade
                </a>
              </label>
            </div>

            <div>
              <button
                data-testid="register-submit"
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  "Criar conta"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
