import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  CreditCard,
  MapPin,
  Users,
  Home,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import api from "../lib/api";

interface ImovelDetalhado {
  id: string | number;
  titulo: string;
  tipo: "QUARTO" | "CASA" | "APARTAMENTO" | "CHACARA";
  cidade: string;
  endereco: string;
  capacidade: number;
  precoPorNoite: number;
  fotos: string[];
  descricao: string;
  notaMedia: number;
  totalAvaliacoes: number;
  proprietario: { id: string | number; nome: string; foto?: string };
  avaliacoes: Array<{
    id: string | number;
    autorNome: string;
    autorFoto?: string;
    nota: number;
    comentario: string;
    data?: string;
  }>;
}

const ImovelDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [imovel, setImovel] = useState<ImovelDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    const fetchImovel = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await api.get(`/imoveis/${id}`);
        const data = response.data;

        const fotoPrincipal =
          data.foto ||
          "https://img.icons8.com/?size=9000&id=86315&format=png&color=7950F2";

        const imovelTransformado: ImovelDetalhado = {
          ...data,
          precoPorNoite: parseFloat(data.precoPorNoite),
          fotos: [fotoPrincipal],
          notaMedia: 5.0,
          totalAvaliacoes: 0,
          proprietario: { ...data.proprietario, foto: "" },
          avaliacoes: [],
        };
        setImovel(imovelTransformado);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchImovel();
  }, [id]);

  useEffect(() => {
    if (dataInicio && dataFim && imovel) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (inicio >= fim) {
        setValorTotal(0);
        return;
      }
      const diffTime = Math.abs(fim.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setValorTotal(diffDays * imovel.precoPorNoite);
    }
  }, [dataInicio, dataFim, imovel]);

  const handleReservar = async () => {
    if (!isAuthenticated) {
      toast.error("Faça login para realizar uma reserva");
      navigate("/login");
      return;
    }
    if (!dataInicio || !dataFim || !imovel) {
      toast.error("Selecione as datas da sua estadia");
      return;
    }
    try {
      const dadosReserva = { imovelId: imovel.id, dataInicio, dataFim };
      await api.post("/reservas", dadosReserva);
      toast.success("Solicitação de reserva enviada!");
      navigate("/minhas-viagens");
    } catch {
      toast.error("Imóvel indisponível para reserva");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Carregando detalhes...
      </div>
    );
  if (error || !imovel)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        Erro ao carregar imóvel.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {imovel.titulo}
          </h1>
          <div className="flex items-center text-gray-600 text-sm">
            <div className="flex items-center mr-4">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="font-medium text-black">
                {imovel.notaMedia.toFixed(1)}
              </span>
              <span className="mx-1">·</span>
              <span className="underline">
                {imovel.totalAvaliacoes} avaliações
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{imovel.cidade}</span>
              {imovel.endereco && (
                <span className="mx-1">· {imovel.endereco}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-xl overflow-hidden shadow-sm h-[400px] bg-gray-200">
          <img
            src={imovel.fotos[0]}
            alt={imovel.titulo}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center border-b pb-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {imovel.tipo.charAt(0) + imovel.tipo.slice(1).toLowerCase()}{" "}
                  inteiro
                </h2>
                <div className="flex items-center text-gray-600 text-sm space-x-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {imovel.capacidade}{" "}
                    hóspedes
                  </span>
                  <span className="flex items-center">
                    <Home className="w-4 h-4 mr-1" />{" "}
                    {imovel.tipo.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                {imovel.proprietario.foto ? (
                  <img
                    src={imovel.proprietario.foto}
                    alt={imovel.proprietario.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                    {imovel.proprietario.nome?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-gray-900 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Sobre este espaço
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {imovel.descricao}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-xl sticky top-24 border border-gray-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {imovel.precoPorNoite.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-gray-500 text-sm"> / noite</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">{imovel.notaMedia}</span>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="flex border-b border-gray-300">
                  <div className="w-1/2 p-3 border-r border-gray-300">
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                      Check-in
                    </label>
                    <input
                      data-testid="input-checkin"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full text-sm text-gray-600 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="w-1/2 p-3">
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                      Check-out
                    </label>
                    <input
                      data-testid="input-checkout"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full text-sm text-gray-600 outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {valorTotal > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span className="underline">
                      R$ {imovel.precoPorNoite.toLocaleString("pt-BR")} x{" "}
                      {Math.ceil(
                        (new Date(dataFim).getTime() -
                          new Date(dataInicio).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      noites
                    </span>
                    <span>R$ {valorTotal.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100 mt-2">
                    <span>Total</span>
                    <span>R$ {valorTotal.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              )}

              <button
                data-testid="btn-reservar"
                onClick={handleReservar}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex justify-center items-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Reservar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImovelDetalhes;
