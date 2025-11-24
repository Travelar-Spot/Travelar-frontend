import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ImovelCard, { Imovel } from "../components/ImovelCard";
import api from "../lib/api";

const Home: React.FC = () => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImoveis = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get("/imoveis");
        const imoveisTransformados = (response.data || []).map(
          (imovel: {
            avaliacoes?: Array<{ nota: string | number }>;
            precoPorNoite: string | number;
            [key: string]: unknown;
          }) => {
            const totalAvaliacoes = imovel.avaliacoes?.length || 0;
            const notaMedia =
              totalAvaliacoes > 0
                ? imovel.avaliacoes!.reduce(
                    (acc: number, avaliacao: { nota: string | number }) =>
                      acc + (Number(avaliacao.nota) || 0),
                    0,
                  ) / totalAvaliacoes
                : 0;

            return {
              ...imovel,
              precoPorNoite: Number(imovel.precoPorNoite) || 0,
              notaMedia,
              totalAvaliacoes,
            };
          },
        );
        setImoveis(imoveisTransformados);
      } catch (err) {
        console.error("Falha ao buscar imóveis:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImoveis();
  }, []);

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
      <div className="bg-gray-200 aspect-[4/3] rounded-md mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1)",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Encontre sua hospedagem perfeita
          </h1>
          <p className="text-xl md:text-3xl mb-8 text-gray-200">
            Descubra lugares únicos para se hospedar com anfitriões locais
          </p>
        </div>
      </section>
      <section className="relative z-20 -mt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <SearchBar />
        </div>
      </section>
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Imóveis em Destaque
            </h2>
            <p className="text-lg text-gray-600">
              Seleção especial das melhores propriedades
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 16 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : error ? (
              <div className="col-span-full text-center py-10">
                <p className="text-red-500 font-semibold">
                  Ops! Algo deu errado ao buscar os imóveis.
                </p>
                <p className="text-gray-600">
                  Por favor, tente recarregar a página.
                </p>
              </div>
            ) : (
              imoveis
                .slice(0, 16)
                .map((imovel) => (
                  <ImovelCard
                    key={imovel.id}
                    imovel={imovel}
                    viewMode={"grid"}
                  />
                ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
