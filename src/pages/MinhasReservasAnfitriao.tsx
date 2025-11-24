import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import api from "../lib/api";
import { CheckCircle } from "lucide-react";

interface ReservaAnfitriao {
  id: number;
  cliente: { id: number; nome: string };
  imovel: { id: number; titulo: string };
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  status:
    | "PENDENTE"
    | "CONFIRMADA"
    | "CANCELADA_CLIENTE"
    | "CANCELADA_PROPRIETARIO"
    | "CONCLUIDA";
  criadoEm: string;
}

const MinhasReservasAnfitriao: React.FC = () => {
  const { isProprietario } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<
    "pendentes" | "confirmadas" | "outras"
  >("pendentes");
  const [reservas, setReservas] = useState<ReservaAnfitriao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = useCallback(async () => {
    if (!isProprietario) return;
    setLoading(true);
    try {
      const response = await api.get<ReservaAnfitriao[]>(
        "/reservas/proprietario/me",
      );
      setReservas(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isProprietario]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const reservasFiltradas = reservas.filter((reserva) => {
    if (abaAtiva === "pendentes") return reserva.status === "PENDENTE";
    if (abaAtiva === "confirmadas") return reserva.status === "CONFIRMADA";
    if (abaAtiva === "outras")
      return reserva.status !== "PENDENTE" && reserva.status !== "CONFIRMADA";
    return false;
  });

  const handleStatus = async (
    id: number,
    status: "CONFIRMADA" | "CANCELADA_PROPRIETARIO" | "CONCLUIDA",
  ) => {
    try {
      await api.patch(`/reservas/${id}/status`, { status });

      let msg = "Status atualizado!";
      if (status === "CONFIRMADA") msg = "Reserva confirmada!";
      if (status === "CONCLUIDA") msg = "Estadia concluída com sucesso!";

      toast.success(msg);
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } catch (error: unknown) {
      console.error("Erro ao atualizar status:", error);
      let errorMessage = "Erro ao atualizar status";
      if (error && typeof error === "object" && "response" in error) {
        const e = error as { response?: { data?: { message?: string } } };
        errorMessage = e.response?.data?.message || errorMessage;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!isProprietario) return <div>Acesso negado</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gerenciar Reservas
        </h1>
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex justify-around px-6">
            <button
              data-testid="tab-pendentes"
              onClick={() => setAbaAtiva("pendentes")}
              className={`py-4 px-4 border-b-2 ${abaAtiva === "pendentes" ? "border-blue-500" : "border-transparent"}`}
            >
              Pendentes
            </button>
            <button
              data-testid="tab-confirmadas"
              onClick={() => setAbaAtiva("confirmadas")}
              className={`py-4 px-4 border-b-2 ${abaAtiva === "confirmadas" ? "border-blue-500" : "border-transparent"}`}
            >
              Confirmadas
            </button>
            <button
              data-testid="tab-outras"
              onClick={() => setAbaAtiva("outras")}
              className={`py-4 px-4 border-b-2 ${abaAtiva === "outras" ? "border-blue-500" : "border-transparent"}`}
            >
              Outras
            </button>
          </nav>
        </div>

        <div className="space-y-6" data-testid="lista-solicitacoes">
          {reservasFiltradas.map((reserva, index) => (
            <div key={reserva.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{reserva.imovel.titulo}</h3>
                  <p>Hóspede: {reserva.cliente.nome}</p>
                </div>
                <div>
                  <span
                    data-testid={`status-solicitacao-${index}`}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm mr-4"
                  >
                    {reserva.status}
                  </span>

                  {reserva.status === "PENDENTE" && (
                    <>
                      <button
                        data-testid={`btn-confirmar-reserva-${index}`}
                        onClick={() => handleStatus(reserva.id, "CONFIRMADA")}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                      >
                        Confirmar
                      </button>
                      <button
                        data-testid={`btn-recusar-reserva-${index}`}
                        onClick={() =>
                          handleStatus(reserva.id, "CANCELADA_PROPRIETARIO")
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Recusar
                      </button>
                    </>
                  )}

                  {reserva.status === "CONFIRMADA" && (
                    <button
                      data-testid={`btn-concluir-reserva-${index}`}
                      onClick={() => handleStatus(reserva.id, "CONCLUIDA")}
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Concluir Estadia
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default MinhasReservasAnfitriao;
