import React, { useEffect, useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  initialValues?: Partial<SearchFilters>;
  className?: string;
}

export interface SearchFilters {
  cidade: string;
  dataInicio: string;
  dataFim: string;
  capacidade: number;
}

const buildQueryString = (filters: SearchFilters) => {
  const params = new URLSearchParams();
  if (filters.cidade) params.set("cidade", filters.cidade);
  if (filters.dataInicio) params.set("dataInicio", filters.dataInicio);
  if (filters.dataFim) params.set("dataFim", filters.dataFim);
  if (filters.capacidade && filters.capacidade > 1)
    params.set("capacidade", String(filters.capacidade));
  return params.toString();
};

const parseQueryToFilters = (search: string): SearchFilters => {
  const p = new URLSearchParams(search);
  return {
    cidade: p.get("cidade") || "",
    dataInicio: p.get("dataInicio") || "",
    dataFim: p.get("dataFim") || "",
    capacidade: parseInt(p.get("capacidade") || "1"),
  };
};

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValues,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState<SearchFilters>({
    cidade: initialValues?.cidade || "",
    dataInicio: initialValues?.dataInicio || "",
    dataFim: initialValues?.dataFim || "",
    capacidade: initialValues?.capacidade || 1,
  });

  useEffect(() => {
    if (!initialValues) return;
    setFilters((prev) => ({
      cidade: initialValues.cidade ?? prev.cidade,
      dataInicio: initialValues.dataInicio ?? prev.dataInicio,
      dataFim: initialValues.dataFim ?? prev.dataFim,
      capacidade: initialValues.capacidade ?? prev.capacidade,
    }));
  }, [initialValues]);

  useEffect(() => {
    const qs = parseQueryToFilters(location.search);
    if (
      qs.cidade !== filters.cidade ||
      qs.dataInicio !== filters.dataInicio ||
      qs.dataFim !== filters.dataFim ||
      qs.capacidade !== filters.capacidade
    ) {
      setFilters(qs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SearchFilters = {
      cidade: (filters.cidade || "").trim(),
      dataInicio: filters.dataInicio || "",
      dataFim: filters.dataFim || "",
      capacidade: filters.capacidade || 1,
    };
    const qs = buildQueryString(payload);
    if (onSearch) {
      try {
        onSearch(payload);
      } catch (err) {
        console.error("onSearch error:", err);
      }
      navigate(`/buscar${qs ? `?${qs}` : ""}`);
      return;
    }
    navigate(`/buscar${qs ? `?${qs}` : ""}`);
  };

  const updateFilter = (key: keyof SearchFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destino
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              data-testid="search-city-input"
              type="text"
              placeholder="Para onde?"
              value={filters.cidade}
              onChange={(e) => updateFilter("cidade", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              data-testid="search-checkin-input"
              type="date"
              value={filters.dataInicio}
              onChange={(e) => updateFilter("dataInicio", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              data-testid="search-checkout-input"
              type="date"
              value={filters.dataFim}
              onChange={(e) => updateFilter("dataFim", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hóspedes
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              data-testid="search-guests-select"
              value={filters.capacidade}
              onChange={(e) =>
                updateFilter("capacidade", parseInt(e.target.value))
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "hóspede" : "hóspedes"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          data-testid="search-submit-button"
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 font-semibold"
        >
          <Search className="w-5 h-5" />
          <span>Buscar</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
