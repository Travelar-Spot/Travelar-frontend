import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Home,
  DollarSign,
  Users,
  MapPin,
  FileText,
  Type,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

interface ImovelFormData {
  titulo: string;
  descricao: string;
  tipo: "QUARTO" | "CASA" | "APARTAMENTO" | "CHACARA";
  endereco: string;
  cidade: string;
  precoPorNoite: number | "";
  capacidade: number | "";
  disponivel: boolean;
  foto: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const CadastrarImovel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, verificarImoveis } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<ImovelFormData>({
    titulo: "",
    descricao: "",
    tipo: "CASA",
    endereco: "",
    cidade: "",
    precoPorNoite: "",
    capacidade: "",
    disponivel: true,
    foto: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para cadastrar um imóvel.");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    if (isCheckbox) {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const isNumericField = name === "precoPorNoite" || name === "capacidade";
      setFormData((prev) => ({
        ...prev,
        [name]: isNumericField ? (value === "" ? "" : Number(value)) : value,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await api.post("/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const novaFotoUrl = response.data.url;

      setFormData((prev) => ({ ...prev, foto: novaFotoUrl }));
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar a foto. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.titulo ||
      !formData.descricao ||
      !formData.cidade ||
      formData.precoPorNoite === "" ||
      formData.capacidade === ""
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!user) {
      toast.error("Erro de autenticação. Por favor, faça login novamente.");
      return;
    }

    setIsLoading(true);

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      endereco: formData.endereco,
      cidade: formData.cidade,
      disponivel: formData.disponivel,
      precoPorNoite: Number(formData.precoPorNoite),
      capacidade: Number(formData.capacidade),
      ownerId: Number(user.id),
      foto: formData.foto,
    };

    try {
      const response = await api.post("/imoveis", payload);
      if (response && response.status === 201) {
        toast.success("Imóvel cadastrado com sucesso!");
        await verificarImoveis();
        navigate("/meus-imoveis");
      } else {
        toast.error(
          `Erro inesperado do servidor: Status ${response?.status || "desconhecido"}`,
        );
      }
    } catch (error: unknown) {
      let errorMessage =
        "Não foi possível cadastrar o imóvel. Verifique os dados ou tente novamente.";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as ApiError;
        errorMessage = apiError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastrar Novo Imóvel
          </h1>
          <p className="text-gray-600">
            Preencha os detalhes abaixo para adicionar sua propriedade à
            plataforma.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-8 space-y-6"
        >
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Imóvel
            </label>

            <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
              {formData.foto ? (
                <img
                  src={formData.foto}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : null}

              <div className="text-center relative z-10">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-gray-600">Enviando imagem...</p>
                  </div>
                ) : (
                  <>
                    <Camera
                      className="mx-auto h-12 w-12 text-gray-300"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white px-3 py-1 font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500 shadow-sm"
                      >
                        <span>Enviar um arquivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleImageUpload}
                          accept="image/*"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="titulo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Título do Anúncio
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  data-testid="imovel-titulo"
                  id="titulo"
                  name="titulo"
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Casa aconchegante com piscina"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Propriedade
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  data-testid="imovel-tipo"
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="QUARTO">Quarto</option>
                  <option value="CASA">Casa</option>
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="CHACARA">Chacara</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="endereco"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  data-testid="imovel-endereco"
                  id="endereco"
                  name="endereco"
                  type="text"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, Número, Bairro"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="cidade"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cidade
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  data-testid="imovel-cidade"
                  id="cidade"
                  name="cidade"
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Brasília, DF"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="precoPorNoite"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Preço por Noite (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  data-testid="imovel-preco"
                  id="precoPorNoite"
                  name="precoPorNoite"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precoPorNoite}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 250.00"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="capacidade"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Capacidade de Hóspedes
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  data-testid="imovel-capacidade"
                  id="capacidade"
                  name="capacidade"
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={formData.capacidade}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 4"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <textarea
                data-testid="imovel-descricao"
                id="descricao"
                name="descricao"
                required
                value={formData.descricao}
                onChange={handleChange}
                rows={5}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva os detalhes do seu espaço, comodidades e o que o torna único."
              ></textarea>
            </div>
          </div>

          <div className="flex items-center">
            <input
              data-testid="imovel-disponivel"
              id="disponivel"
              name="disponivel"
              type="checkbox"
              checked={formData.disponivel}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="disponivel"
              className="ml-2 block text-sm text-gray-900"
            >
              Disponível para reservas imediatas
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              data-testid="imovel-submit"
              type="submit"
              disabled={isLoading || isUploading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>
                {isUploading
                  ? "Enviando foto..."
                  : isLoading
                    ? "Salvando..."
                    : "Salvar Imóvel"}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CadastrarImovel;
