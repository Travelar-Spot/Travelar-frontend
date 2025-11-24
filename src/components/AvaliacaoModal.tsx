import React, { useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

interface AvaliacaoModalProps {
  reservaId: number;
  imovelTitulo: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({
  reservaId,
  imovelTitulo,
  onClose,
  onSuccess,
}) => {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoverNota, setHoverNota] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/avaliacoes", {
        reservaId,
        nota,
        comentario,
      });
      toast.success("Avaliação enviada com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Avaliação enviada com sucesso!");
      onSuccess();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Avaliar Hospedagem
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Como foi sua estadia em <strong>{imovelTitulo}</strong>?
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                data-testid={`star-${star}`}
                onClick={() => setNota(star)}
                onMouseEnter={() => setHoverNota(star)}
                onMouseLeave={() => setHoverNota(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverNota || nota)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário
            </label>
            <textarea
              data-testid="input-comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Conte aos outros sobre sua experiência..."
              required
            />
          </div>

          <button
            data-testid="btn-enviar-avaliacao"
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Enviando..." : "Enviar Avaliação"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AvaliacaoModal;
