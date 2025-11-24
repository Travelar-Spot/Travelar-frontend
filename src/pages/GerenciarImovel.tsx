import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Edit,
  Save,
  Home,
  Users,
  DollarSign,
  FileText,
  X,
  LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/Footer";

interface ImovelFormData {
  titulo: string;
  tipo: "QUARTO" | "CASA" | "APARTAMENTO" | "CHACARA";
  cidade: string;
  endereco: string;
  capacidade: number;
  precoPorNoite: number;
  descricao: string;
  disponivel: boolean;
}

interface ReservaImovel {
  id: string;
  cliente: { nome: string; email: string };
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
}

interface CampoDetalheProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  name?: string;
  type?: string;
  options?: { value: string; label: string }[];
  editing?: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const CampoDetalhe = React.memo(
  ({
    icon: Icon,
    label,
    value,
    name,
    type = "text",
    options,
    editing = false,
    onChange,
  }: CampoDetalheProps) => {
    const renderInput = () => {
      if (type === "select" && options) {
        return (
          <select
            data-testid={`input-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (type === "textarea") {
        return (
          <textarea
            data-testid={`input-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      }

      return (
        <input
          data-testid={`input-${name}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      );
    };

    const renderDisplay = () => {
      if (type === "number" && name === "precoPorNoite") {
        return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      }
      if (type === "select") {
        return options?.find((opt) => opt.value === value)?.label || value;
      }
      return value;
    };

    return (
      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
        <Icon className="w-5 h-5 text-gray-700 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {editing ? (
            renderInput()
          ) : (
            <p className="text-gray-900" data-testid={`display-${name}`}>
              {renderDisplay()}
            </p>
          )}
        </div>
      </div>
    );
  },
);

CampoDetalhe.displayName = "CampoDetalhe";

const GerenciarImovel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<
    "detalhes" | "reservas" | "avaliacoes"
  >("detalhes");
  const [formData, setFormData] = useState<ImovelFormData | null>(null);
  const [initialData, setInitialData] = useState<ImovelFormData | null>(null);
  const [reservas, setReservas] = useState<ReservaImovel[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para gerenciar um imóvel.");
      navigate("/login");
      return;
    }

    if (!id) {
      setError(true);
      return;
    }

    if (!user?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const response = await api.get(`/imoveis/${id}`);
        const data = response.data;

        if (user.id.toString() !== data.proprietario?.id.toString()) {
          toast.error("Você não tem permissão para editar este imóvel.");
          navigate("/meus-imoveis");
          return;
        }

        const imovelParaForm: ImovelFormData = {
          titulo: data.titulo,
          tipo: data.tipo,
          cidade: data.cidade,
          endereco: data.endereco,
          capacidade: data.capacidade,
          precoPorNoite: parseFloat(data.precoPorNoite),
          descricao: data.descricao,
          disponivel: data.disponivel,
        };

        const reservasDoImovel = (data.reservas || []).map(
          (res: {
            id: string;
            cliente?: { nome: string };
            dataInicio: string;
            dataFim: string;
            valorTotal: number;
          }) => ({
            ...res,
            cliente: res.cliente || { nome: "Hóspede" },
          }),
        );

        setFormData(imovelParaForm);
        setInitialData(imovelParaForm);
        setReservas(reservasDoImovel);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError(true);
        toast.error("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id, isAuthenticated, navigate]);

  const handleSave = async () => {
    if (!formData || !id) return;

    setIsSaving(true);
    try {
      await api.put(`/imoveis/${id}`, {
        titulo: formData.titulo,
        tipo: formData.tipo,
        cidade: formData.cidade,
        endereco: formData.endereco,
        capacidade: Number(formData.capacidade),
        precoPorNoite: Number(formData.precoPorNoite),
        descricao: formData.descricao,
        disponivel: formData.disponivel,
      });

      toast.success("Imóvel atualizado com sucesso!");
      setInitialData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar imóvel:", error);
      toast.error("Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  const handleFormChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value, type } = e.target;

      setFormData((prev) => {
        if (!prev) return null;

        if (type === "checkbox") {
          return { ...prev, [name]: (e.target as HTMLInputElement).checked };
        }

        const isNumberField = name === "precoPorNoite" || name === "capacidade";
        return {
          ...prev,
          [name]: isNumberField ? (value === "" ? 0 : Number(value)) : value,
        };
      });
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Erro ao Carregar
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? "Editando: " : ""}
              <span data-testid="titulo-header">{formData.titulo}</span>
            </h1>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-1" />
              <span>{formData.cidade}</span>
            </div>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            {isEditing ? (
              <>
                <button
                  data-testid="btn-cancelar-edicao"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  data-testid="btn-salvar-edicao"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Salvando..." : "Salvar"}</span>
                </button>
              </>
            ) : (
              <button
                data-testid="btn-ativar-edicao"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex justify-around px-6">
              <button
                onClick={() => setAbaAtiva("detalhes")}
                className={`py-4 px-4 border-b-2 font-medium ${abaAtiva === "detalhes" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                Detalhes
              </button>
              <button
                onClick={() => setAbaAtiva("reservas")}
                className={`py-4 px-4 border-b-2 font-medium ${abaAtiva === "reservas" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                Reservas ({reservas.length})
              </button>
              <button
                onClick={() => setAbaAtiva("avaliacoes")}
                className={`py-4 px-4 border-b-2 font-medium ${abaAtiva === "avaliacoes" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                Avaliações
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {abaAtiva === "detalhes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <CampoDetalhe
                    icon={Home}
                    label="Título"
                    value={formData.titulo}
                    name="titulo"
                    editing={isEditing}
                    onChange={handleFormChange}
                  />
                  <CampoDetalhe
                    icon={MapPin}
                    label="Cidade"
                    value={formData.cidade}
                    name="cidade"
                    editing={isEditing}
                    onChange={handleFormChange}
                  />
                  <CampoDetalhe
                    icon={DollarSign}
                    label="Preço por noite"
                    value={formData.precoPorNoite}
                    name="precoPorNoite"
                    type="number"
                    editing={isEditing}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-6">
                  <CampoDetalhe
                    icon={Home}
                    label="Tipo"
                    value={formData.tipo}
                    name="tipo"
                    type="select"
                    options={[
                      { value: "QUARTO", label: "Quarto" },
                      { value: "CASA", label: "Casa" },
                      { value: "APARTAMENTO", label: "Apartamento" },
                      { value: "CHACARA", label: "Chácara" },
                    ]}
                    editing={isEditing}
                    onChange={handleFormChange}
                  />
                  <CampoDetalhe
                    icon={MapPin}
                    label="Endereço"
                    value={formData.endereco}
                    name="endereco"
                    editing={isEditing}
                    onChange={handleFormChange}
                  />
                  <CampoDetalhe
                    icon={Users}
                    label="Capacidade"
                    value={formData.capacidade}
                    name="capacidade"
                    type="number"
                    editing={isEditing}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="col-span-full">
                <CampoDetalhe
                  icon={FileText}
                  label="Descrição"
                  value={formData.descricao}
                  name="descricao"
                  type="textarea"
                  editing={isEditing}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          )}
          {abaAtiva === "reservas" && (
            <div className="space-y-4">
              {reservas.length > 0 ? (
                reservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <p className="font-semibold">{reserva.cliente.nome}</p>
                    <p className="text-sm text-gray-600">
                      R$ {reserva.valorTotal}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma reserva.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GerenciarImovel;
