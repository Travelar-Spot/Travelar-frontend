import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Buscar from "./pages/Buscar";
import ImovelDetalhes from "./pages/ImovelDetalhes";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import MinhasViagens from "./pages/MinhasViagens";
import MeuPerfil from "./pages/MeuPerfil";

import MeusImoveis from "./pages/MeusImoveis";
import CadastrarImovel from "./pages/CadastrarImovel";
import GerenciarImovel from "./pages/GerenciarImovel";
import MinhasReservasAnfitriao from "./pages/MinhasReservasAnfitriao";

import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-grow pb-64">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/buscar" element={<Buscar />} />
              <Route path="/imoveis/:id" element={<ImovelDetalhes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />

              <Route path="/minhas-viagens" element={<MinhasViagens />} />
              <Route path="/meu-perfil" element={<MeuPerfil />} />

              <Route path="/meus-imoveis" element={<MeusImoveis />} />
              <Route
                path="/gerenciar-imovel/novo"
                element={<CadastrarImovel />}
              />
              <Route
                path="/gerenciar-imovel/:id"
                element={<GerenciarImovel />}
              />
              <Route
                path="/reservas-anfitriao"
                element={<MinhasReservasAnfitriao />}
              />
            </Routes>
          </main>

          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
