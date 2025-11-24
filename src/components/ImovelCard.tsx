import React from "react";
import { Star, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

export interface Imovel {
  avaliacoes: { nota: number }[];
  id: string | number;
  titulo: string;
  tipo: "CASA" | "APARTAMENTO" | "QUARTO" | "CHACARA";
  cidade: string;
  capacidade: number;
  precoPorNoite: number;
  foto?: string;
  notaMedia?: number;
  totalAvaliacoes?: number;
  disponivel: boolean;
}

interface ImovelCardProps {
  imovel: Imovel;
  showFavorite?: boolean;
  viewMode: "grid" | "list";
}

const ImovelCard: React.FC<ImovelCardProps> = ({ imovel, viewMode }) => {
  const isListView = viewMode === "list";

  const fotoPrincipal =
    imovel.foto ||
    "https://img.icons8.com/?size=6000&id=86315&format=png&color=7950F2";
  const notaMedia = imovel.notaMedia?.toFixed(1) ?? "N/A";
  const totalAvaliacoes = imovel.totalAvaliacoes ?? 0;

  return (
    <Link to={`/imoveis/${imovel.id}`} className="group">
      <div
        className={`
        bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden 
        flex ${isListView ? "flex-row h-40" : "flex-col"}
      `}
      >
        <div
          className={`
          relative overflow-hidden 
          ${isListView ? "w-48 flex-shrink-0" : "aspect-[4/3]"}
        `}
        >
          <img
            src={fotoPrincipal}
            alt={imovel.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div
          className={`
          p-4 
          ${isListView ? "flex-1 flex flex-col justify-between" : ""}
        `}
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{imovel.cidade}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">{notaMedia}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({totalAvaliacoes})
                </span>
              </div>
            </div>
            <h3
              className={`
              font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors
              ${isListView ? "line-clamp-1" : "line-clamp-2"}
            `}
            >
              {imovel.titulo}
            </h3>
            <div
              className={`
              flex items-center text-gray-600 text-sm 
              ${isListView ? "mb-0" : "mb-3"}
            `}
            >
              <span className="capitalize">{imovel.tipo?.toLowerCase()}</span>
              <span className="mx-2">•</span>
              <Users className="w-4 h-4 mr-1" />
              <span>{imovel.capacidade} hóspedes</span>
            </div>
          </div>
          <div
            className={`
            flex items-baseline
            ${isListView ? "" : "mt-auto"} 
          `}
          >
            <span className="text-xl font-bold text-gray-900">
              R$ {imovel.precoPorNoite?.toLocaleString("pt-BR")}
            </span>
            <span className="text-gray-600 text-sm ml-1">/ noite</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
