import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import SearchBar, { SearchFilters } from "../components/SearchBar";
import ImovelCard, { Imovel } from "../components/ImovelCard";
import api from "../lib/api";

const Buscar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode] = useState<"grid" | "list">("grid");
  const [ordenacao] = useState("relevancia");

  const [imoveisExibidos, setImoveisExibidos] = useState<Imovel[]>([]);
  const [todosImoveis, setTodosImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [filtros, setFiltros] = useState(() => ({
    cidade: searchParams.get("cidade") || "",
    dataInicio: searchParams.get("dataInicio") || "",
    dataFim: searchParams.get("dataFim") || "",
    capacidade: parseInt(searchParams.get("capacidade") || "1", 10),
    precoMin: parseInt(searchParams.get("minPreco") || "0", 10),
    precoMax: parseInt(searchParams.get("maxPreco") || "5000", 10),
    tipos: searchParams.getAll("tipo") || [],
    notaMinima: Number(searchParams.get("notaMinima") || "0"),
  }));

  const debounceTimer = useRef<number | null>(null);

  const normalizarTexto = (texto: string): string => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const aplicarFiltros = useCallback(
    (imoveis: Imovel[], filtrosAtuais: typeof filtros) => {
      let imoveisFiltrados = [...imoveis];

      if (filtrosAtuais.cidade) {
        const termoBusca = normalizarTexto(filtrosAtuais.cidade);
        imoveisFiltrados = imoveisFiltrados.filter((imovel) => {
          const cidadeImovel = normalizarTexto(imovel.cidade || "");
          const palavrasBusca = termoBusca
            .split(" ")
            .filter((palavra) => palavra.length > 0);

          return palavrasBusca.some((palavra) =>
            cidadeImovel.includes(palavra),
          );
        });
      }

      if (filtrosAtuais.capacidade > 1) {
        imoveisFiltrados = imoveisFiltrados.filter(
          (imovel) => imovel.capacidade >= filtrosAtuais.capacidade,
        );
      }

      imoveisFiltrados = imoveisFiltrados.filter(
        (imovel) =>
          imovel.precoPorNoite >= filtrosAtuais.precoMin &&
          imovel.precoPorNoite <= filtrosAtuais.precoMax,
      );

      if (filtrosAtuais.tipos.length > 0) {
        imoveisFiltrados = imoveisFiltrados.filter((imovel) =>
          filtrosAtuais.tipos.includes(imovel.tipo),
        );
      }

      if (filtrosAtuais.notaMinima > 0) {
        imoveisFiltrados = imoveisFiltrados.filter(
          (imovel) => (imovel.notaMedia ?? 0) >= filtrosAtuais.notaMinima,
        );
      }

      switch (ordenacao) {
        case "preco-menor":
          imoveisFiltrados.sort((a, b) => a.precoPorNoite - b.precoPorNoite);
          break;
        case "preco-maior":
          imoveisFiltrados.sort((a, b) => b.precoPorNoite - a.precoPorNoite);
          break;
        case "avaliacao":
          imoveisFiltrados.sort(
            (a, b) => (b.notaMedia ?? 0) - (a.notaMedia ?? 0),
          );
          break;
        default:
          imoveisFiltrados.sort((a, b) => {
            if (a.disponivel !== b.disponivel) {
              return a.disponivel ? -1 : 1;
            }
            return (b.notaMedia ?? 0) - (a.notaMedia ?? 0);
          });
          break;
      }

      setImoveisExibidos(imoveisFiltrados);
    },
    [ordenacao],
  );

  useEffect(() => {
    (async function fetchData() {
      setLoading(true);
      setError(false);

      try {
        const response = await api.get<Imovel[]>("/imoveis");

        const imoveisDaApi = (response.data || []).map(
          (imovel: Imovel): Imovel => {
            const totalAvaliacoes = imovel.avaliacoes?.length || 0;
            const notaMedia =
              totalAvaliacoes > 0
                ? imovel.avaliacoes.reduce(
                    (acc: number, a: { nota: string | number }) =>
                      acc + (Number(a.nota) || 0),
                    0,
                  ) / totalAvaliacoes
                : 0;

            return {
              ...imovel,
              precoPorNoite: Number(imovel.precoPorNoite) || 0,
              notaMedia: Math.round(notaMedia * 10) / 10,
              totalAvaliacoes,
            };
          },
        );

        setTodosImoveis(imoveisDaApi);
        aplicarFiltros(imoveisDaApi, filtros);
      } catch (err) {
        console.error("Erro ao buscar imóveis:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [aplicarFiltros, filtros]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      const params: Record<string, string> = {};

      if (filtros.cidade) params.cidade = filtros.cidade;
      if (filtros.capacidade > 1)
        params.capacidade = filtros.capacidade.toString();
      if (filtros.precoMin > 0) params.minPreco = filtros.precoMin.toString();
      if (filtros.precoMax < 5000)
        params.maxPreco = filtros.precoMax.toString();
      if (filtros.tipos.length > 0) params.tipo = filtros.tipos.join(",");

      setSearchParams(params, { replace: true });
      aplicarFiltros(todosImoveis, filtros);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filtros, ordenacao, todosImoveis, setSearchParams, aplicarFiltros]);

  const handleSearch = (newSearchFilters: SearchFilters) =>
    setFiltros((prev) => ({ ...prev, ...newSearchFilters }));

  const handleFiltroChange = <K extends keyof typeof filtros>(
    campo: K,
    valor: (typeof filtros)[K],
  ) => setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const SkeletonCard = ({ viewMode }: { viewMode: "grid" | "list" }) => {
    const isListView = viewMode === "list";
    return (
      <div
        className={`bg-white rounded-xl shadow-md p-4 animate-pulse overflow-hidden ${isListView ? "flex flex-row h-40" : ""}`}
      >
        <div
          className={`bg-gray-200 rounded-md ${isListView ? "w-48 h-full flex-shrink-0" : "aspect-[4/3] mb-4"}`}
        ></div>
        <div
          className={` ${isListView ? "flex-1 flex flex-col justify-between ml-4" : ""}`}
        >
          <div>
            <div
              className={`h-4 bg-gray-200 rounded ${isListView ? "w-3/4" : "w-3/4 mb-2"}`}
            ></div>
            <div
              className={`h-4 bg-gray-200 rounded mt-2 ${isListView ? "w-1/2" : "w-1/2 mb-4"}`}
            ></div>
          </div>
          <div
            className={`h-6 bg-gray-200 rounded ${isListView ? "w-1/3" : "w-1/3 mt-4"}`}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <SearchBar
            onSearch={handleSearch}
            initialValues={filtros}
            className="shadow-none border border-gray-200"
          />
        </div>
      </section>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            className={`lg:w-80 ${isFilterOpen ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden text-gray-500"
                >
                  ×
                </button>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Preço por noite
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Mín"
                      data-testid="filter-preco-min"
                      value={filtros.precoMin === 0 ? "" : filtros.precoMin}
                      onChange={(e) =>
                        handleFiltroChange(
                          "precoMin",
                          e.target.value === ""
                            ? 0
                            : parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full pl-2 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                    />
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Máx"
                      data-testid="filter-preco-max"
                      value={filtros.precoMax === 5000 ? "" : filtros.precoMax}
                      onChange={(e) =>
                        handleFiltroChange(
                          "precoMax",
                          e.target.value === ""
                            ? 5000
                            : parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full pl-2 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Tipo de propriedade
                </h4>
                <div className="space-y-2">
                  {["QUARTO", "CASA", "APARTAMENTO", "CHACARA"].map((tipo) => (
                    <label key={tipo} className="flex items-center">
                      <input
                        type="checkbox"
                        data-testid={`filter-tipo-${tipo}`}
                        checked={filtros.tipos.includes(tipo)}
                        onChange={() =>
                          handleFiltroChange(
                            "tipos",
                            filtros.tipos.includes(tipo)
                              ? filtros.tipos.filter((t) => t !== tipo)
                              : [...filtros.tipos, tipo],
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {tipo === "CHACARA" ? "Chácara" : tipo.toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2
                    data-testid="search-results-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {loading
                      ? "Buscando..."
                      : `${imoveisExibidos.length} propriedades encontradas`}
                  </h2>
                  {filtros.cidade && (
                    <p className="text-sm text-gray-600">em {filtros.cidade}</p>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} viewMode={viewMode} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-red-600 mb-2">
                  Erro
                </h3>
                <p className="text-gray-600">
                  Não foi possível buscar os imóveis.
                </p>
              </div>
            ) : (
              <>
                {imoveisExibidos.length > 0 ? (
                  <div
                    data-testid="search-results-grid"
                    className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
                  >
                    {imoveisExibidos.map((imovel, index) => (
                      <div key={imovel.id} data-testid={`result-card-${index}`}>
                        <ImovelCard imovel={imovel} viewMode={viewMode} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    data-testid="no-results-message"
                    className="text-center py-12"
                  >
                    <div className="text-gray-400 text-6xl mb-4">🏠</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhum imóvel encontrado
                    </h3>
                    <p className="text-gray-600">
                      Tente ajustar os filtros ou os termos da busca.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Buscar;
