import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface ImovelProprietario {
  id: string | number;
  titulo: string;
  tipo: "QUARTO" | "CASA" | "APARTAMENTO" | "CHACARA";
  cidade: string;
  capacidade: number;
  precoPorNoite: number;
  foto: string;
  disponivel: boolean;
  totalReservas: number;
  notaMedia: number;
  ganhosUltimos30Dias: number;
}

const MeusImoveis: React.FC = () => {
  const { user, verificarImoveis } = useAuth();
  const navigate = useNavigate();
  const [imoveis, setImoveis] = useState<ImovelProprietario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalExcluir, setModalExcluir] = useState<{
    aberto: boolean;
    imovel: ImovelProprietario | null;
  }>({
    aberto: false,
    imovel: null,
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchMeusImoveis = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/imoveis");

        const meusImoveisApi = (res.data || []).filter(
          (imovel: { proprietario?: { id: number | string } }) =>
            imovel.proprietario?.id.toString() === user.id.toString(),
        );

        const imoveisTransformados: ImovelProprietario[] = meusImoveisApi.map(
          (imovel: {
            id: number;
            titulo: string;
            tipo: string;
            cidade: string;
            capacidade: number;
            precoPorNoite: string | number;
            foto?: string;
            disponivel: boolean;
            reservas?: unknown[];
            avaliacoes?: Array<{ nota: number }>;
          }) => {
            const totalReservas = imovel.reservas?.length || 0;
            const totalAvaliacoes = imovel.avaliacoes?.length || 0;
            const notaMedia =
              totalAvaliacoes > 0
                ? imovel.avaliacoes!.reduce(
                    (acc: number, avaliacao: { nota: number }) =>
                      acc + avaliacao.nota,
                    0,
                  ) / totalAvaliacoes
                : 0;

            return {
              id: imovel.id,
              titulo: imovel.titulo,
              tipo: imovel.tipo,
              cidade: imovel.cidade,
              capacidade: imovel.capacidade,
              precoPorNoite: Number(imovel.precoPorNoite) || 0,
              foto:
                imovel.foto ||
                "https://img.icons8.com/?size=5000&id=86315&format=png&color=7950F2",
              disponivel: imovel.disponivel,
              totalReservas,
              notaMedia: Math.round(notaMedia * 10) / 10,
              ganhosUltimos30Dias: 0,
            };
          },
        );

        setImoveis(imoveisTransformados);
        await verificarImoveis();
      } catch (err) {
        console.error("Erro ao carregar imóveis:", err);
        toast.error("Não foi possível carregar seus imóveis.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeusImoveis();
  }, [user, verificarImoveis]);

  const toggleDisponibilidade = async (id: string | number) => {
    const imovel = imoveis.find((i) => i.id === id);
    if (!imovel) return;

    const novoStatus = !imovel.disponivel;

    try {
      await api.put(`/imoveis/${id}`, { disponivel: novoStatus });
      setImoveis((prev) =>
        prev.map((i) => (i.id === id ? { ...i, disponivel: novoStatus } : i)),
      );
      toast.success(
        novoStatus
          ? "Imóvel marcado como disponível!"
          : "Imóvel marcado como indisponível!",
      );
    } catch (err) {
      console.error("Erro ao atualizar disponibilidade:", err);
      toast.error("Não foi possível atualizar o status.");
    }
  };

  const handleExcluirImovel = async () => {
    if (!modalExcluir.imovel) return;
    try {
      await api.delete(`/imoveis/${modalExcluir.imovel.id}`);
      const novaLista = imoveis.filter((i) => i.id !== modalExcluir.imovel!.id);
      setImoveis(novaLista);

      if (novaLista.length === 0) {
        await verificarImoveis();
      }

      toast.success("Imóvel excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      toast.error("Não foi possível excluir o imóvel.");
    } finally {
      setModalExcluir({ aberto: false, imovel: null });
    }
  };

  const handleCardClick = (imovelId: string | number, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.tagName === "BUTTON" ||
      target.tagName === "A"
    ) {
      return;
    }
    navigate(`/imoveis/${imovelId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seus imóveis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meus Imóveis
            </h1>
            <p className="text-gray-600">
              Gerencie suas propriedades e acompanhe o desempenho
            </p>
          </div>
          <Link
            data-testid="btn-novo-imovel"
            to="/gerenciar-imovel/novo"
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Novo Imóvel</span>
          </Link>
        </div>

        {imoveis.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum imóvel cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece cadastrando seu primeiro imóvel para começar a receber
              hóspedes.
            </p>
            <Link
              data-testid="btn-novo-imovel-empty"
              to="/gerenciar-imovel/novo"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cadastrar Primeiro Imóvel
            </Link>
          </div>
        ) : (
          <div className="space-y-6" data-testid="lista-imoveis">
            {imoveis.map((imovel, index) => (
              <div
                key={imovel.id}
                data-testid={`card-imovel-${index}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={(e) => handleCardClick(imovel.id, e)}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={imovel.foto}
                        alt={imovel.titulo}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3
                            className="text-lg font-semibold text-gray-900"
                            data-testid={`titulo-imovel-${index}`}
                          >
                            {imovel.titulo}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center text-gray-600 text-sm mb-3 gap-x-2">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" /> {imovel.cidade}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="capitalize flex items-center">
                            {imovel.tipo.toLowerCase()}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />{" "}
                            {imovel.capacidade} hóspedes
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center space-x-4 text-sm">
                          <div className="flex items-center font-medium text-gray-900">
                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                            R$ {imovel.precoPorNoite.toLocaleString("pt-BR")} /
                            noite
                          </div>
                          <div className="text-gray-600">
                            {imovel.totalReservas} reservas
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDisponibilidade(imovel.id);
                        }}
                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                          imovel.disponivel
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {imovel.disponivel ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        <span>
                          {imovel.disponivel ? "Disponível" : "Indisponível"}
                        </span>
                      </button>

                      <div className="flex space-x-2">
                        <Link
                          data-testid={`btn-editar-${index}`}
                          to={`/gerenciar-imovel/${imovel.id}`}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>
                        <button
                          data-testid={`btn-excluir-${index}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalExcluir({ aberto: true, imovel });
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalExcluir.aberto && modalExcluir.imovel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Excluir Imóvel
            </h3>
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja excluir "{modalExcluir.imovel.titulo}"?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                data-testid="btn-cancelar-exclusao"
                onClick={() => setModalExcluir({ aberto: false, imovel: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                data-testid="btn-confirmar-exclusao"
                onClick={handleExcluirImovel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir Imóvel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeusImoveis;
