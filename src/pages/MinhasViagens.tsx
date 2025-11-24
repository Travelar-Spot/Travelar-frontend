import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import toast from "react-hot-toast";
import api from "../lib/api";
import { Star } from "lucide-react";
import AvaliacaoModal from "../components/AvaliacaoModal";

interface Reserva {
  id: number;
  imovel: { id: number; titulo: string; cidade: string; foto?: string };
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  status:
    | "PENDENTE"
    | "CONFIRMADA"
    | "CANCELADA_CLIENTE"
    | "CANCELADA_PROPRIETARIO"
    | "CONCLUIDA";
  avaliada?: boolean;
}

const MinhasViagens: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<
    "pendentes_confirmadas" | "concluidas" | "canceladas"
  >("pendentes_confirmadas");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalCancelar, setModalCancelar] = useState<{
    aberto: boolean;
    reservaId: number | null;
  }>({ aberto: false, reservaId: null });
  const [modalAvaliar, setModalAvaliar] = useState<{
    aberto: boolean;
    reservaId: number | null;
    imovelTitulo: string;
  }>({ aberto: false, reservaId: null, imovelTitulo: "" });

  const fetchReservas = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get<Reserva[]>("/reservas/cliente/me");
      setReservas(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const reservasFiltradas = reservas.filter((reserva) => {
    switch (abaAtiva) {
      case "pendentes_confirmadas":
        return reserva.status === "PENDENTE" || reserva.status === "CONFIRMADA";
      case "concluidas":
        return reserva.status === "CONCLUIDA";
      case "canceladas":
        return (
          reserva.status === "CANCELADA_CLIENTE" ||
          reserva.status === "CANCELADA_PROPRIETARIO"
        );
      default:
        return false;
    }
  });

  const handleConfirmarCancelamento = async () => {
    if (!modalCancelar.reservaId) return;
    try {
      await api.delete(`/reservas/${modalCancelar.reservaId}`);
      toast.success("Reserva cancelada com sucesso");
      setReservas((prev) =>
        prev.map((r) =>
          r.id === modalCancelar.reservaId
            ? { ...r, status: "CANCELADA_CLIENTE" }
            : r,
        ),
      );
      setModalCancelar({ aberto: false, reservaId: null });
    } catch {
      toast.error("Erro ao cancelar.");
    }
  };

  const handleAvaliacaoSucesso = () => {
    if (modalAvaliar.reservaId) {
      setReservas((prev) =>
        prev.map((r) =>
          r.id === modalAvaliar.reservaId ? { ...r, avaliada: true } : r,
        ),
      );
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Minhas Viagens
        </h1>
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex justify-around px-6">
            <button
              data-testid="tab-pendentes"
              onClick={() => setAbaAtiva("pendentes_confirmadas")}
              className={`py-4 px-4 border-b-2 ${abaAtiva === "pendentes_confirmadas" ? "border-blue-500 text-blue-600" : "border-transparent"}`}
            >
              Próximas/Confirmadas
            </button>
            <button
              data-testid="tab-concluidas"
              onClick={() => setAbaAtiva("concluidas")}
              className={`py-4 px-4 border-b-2 ${abaAtiva === "concluidas" ? "border-blue-500 text-blue-600" : "border-transparent"}`}
            >
              Concluídas
            </button>
            <button
              data-testid="tab-canceladas"
              onClick={() => setAbaAtiva("canceladas")}
              className={`py-4 px-4 border-b-2 ${abaAtiva === "canceladas" ? "border-blue-500 text-blue-600" : "border-transparent"}`}
            >
              Canceladas
            </button>
          </nav>
        </div>

        <div className="space-y-6" data-testid="lista-viagens">
          {reservasFiltradas.map((reserva, index) => (
            <div key={reserva.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {reserva.imovel.titulo}
                  </h3>
                  <p className="text-gray-600">{reserva.imovel.cidade}</p>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <span
                    data-testid={`status-reserva-${index}`}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100"
                  >
                    {reserva.status}
                  </span>

                  {reserva.status === "PENDENTE" && (
                    <button
                      data-testid={`btn-cancelar-reserva-${index}`}
                      onClick={() =>
                        setModalCancelar({
                          aberto: true,
                          reservaId: reserva.id,
                        })
                      }
                      className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                  {(reserva.status === "CONCLUIDA" ||
                    reserva.status === "CONFIRMADA") &&
                    !reserva.avaliada && (
                      <button
                        data-testid={`btn-avaliar-reserva-${index}`}
                        onClick={() =>
                          setModalAvaliar({
                            aberto: true,
                            reservaId: reserva.id,
                            imovelTitulo: reserva.imovel.titulo,
                          })
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        <span>Avaliar</span>
                      </button>
                    )}
                  {reserva.avaliada && (
                    <span className="text-green-600 text-sm flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" /> Avaliada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {modalCancelar.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Cancelar Reserva</h3>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setModalCancelar({ aberto: false, reservaId: null })
                }
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Voltar
              </button>
              <button
                data-testid="btn-confirmar-cancelamento"
                onClick={handleConfirmarCancelamento}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAvaliar.aberto && modalAvaliar.reservaId && (
        <AvaliacaoModal
          reservaId={modalAvaliar.reservaId}
          imovelTitulo={modalAvaliar.imovelTitulo}
          onClose={() => setModalAvaliar({ ...modalAvaliar, aberto: false })}
          onSuccess={handleAvaliacaoSucesso}
        />
      )}
    </div>
  );
};
export default MinhasViagens;
