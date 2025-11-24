import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { User, Phone, Save, Trash2, Camera, Edit, X, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import api from "../lib/api";

const MeuPerfil: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    foto: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchFreshUserData = async () => {
      if (user?.id) {
        try {
          const response = await api.get(`/usuarios/${user.id}`);
          updateUserData(response.data);
        } catch (error) {
          console.error("Erro ao buscar dados atualizados do perfil", error);
        }
      }
    };

    fetchFreshUserData();
  }, [user?.id, updateUserData]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        foto: user.foto || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const updatePayload = {
      nome: formData.nome,
      telefone: formData.telefone,
      foto: formData.foto,
    };

    try {
      const response = await api.put(`/usuarios/${user.id}`, updatePayload);
      updateUserData(response.data);
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Erro ao atualizar perfil:", error);
      let errorMessage = "Erro ao atualizar perfil. Verifique os dados.";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        foto: user.foto || "",
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/usuarios/${user?.id}`);
      toast.success("Conta excluída com sucesso");
      setShowDeleteModal(false);
      logout();
      navigate("/");
    } catch (error: unknown) {
      console.error("Erro ao excluir conta:", error);
      let errorMessage = "Erro ao excluir conta";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await api.post("/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData((prev) => ({
        ...prev,
        foto: response.data.url,
      }));

      toast.success("Foto carregada! Clique em Salvar para confirmar.");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar a foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatarDataCriacao = (dataISO?: string): string => {
    if (!dataISO) return "Data indisponível";
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        timeZone: "UTC",
      });
    } catch {
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Foto do Perfil
              </h3>
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      formData.foto ||
                      "https://img.icons8.com/?size=100&id=fUUEbUbXhzOA&format=png&color=000000"
                    }
                    alt="Foto do perfil"
                    className={`w-32 h-32 rounded-full object-cover mx-auto mb-4 ${isUploading ? "opacity-50" : ""}`}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                        Enviando...
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <label
                      className={`absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 ${isUploading ? "pointer-events-none" : ""}`}
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
                {isEditing && (
                  <p className="text-sm text-gray-600">
                    Clique na câmera para alterar
                  </p>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Informações da Conta
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">
                      {user?.role?.toLowerCase() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desde:</span>
                    <span className="font-medium">
                      {formatarDataCriacao(user?.criadoEm)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informações Pessoais
                </h3>
                {!isEditing ? (
                  <button
                    data-testid="profile-edit-button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                  <button
                    data-testid="profile-cancel-button"
                    onClick={handleCancelEdit}
                    disabled={isLoading || isUploading}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome completo
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                        data-testid="profile-name-input"
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  ) : (
                    <p
                      data-testid="profile-name-display"
                      className="text-gray-900 py-3 px-3 bg-gray-50 rounded-lg min-h-[50px] flex items-center"
                    >
                      {formData.nome || (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                        data-testid="profile-email-input"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <p
                      data-testid="profile-email-display"
                      className="text-gray-900 py-3 px-3 bg-gray-50 rounded-lg min-h-[50px] flex items-center"
                    >
                      {formData.email || (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="telefone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefone
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      <input
                        data-testid="profile-phone-input"
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <p
                      data-testid="profile-phone-display"
                      className="text-gray-900 py-3 px-3 bg-gray-50 rounded-lg min-h-[50px] flex items-center"
                    >
                      {formData.telefone || (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      data-testid="profile-save-button"
                      type="submit"
                      disabled={isLoading || isUploading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                      </span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Segurança
              </h3>
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-red-600 mb-2">
                    Zona de Perigo
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Uma vez que você exclua sua conta, não há como voltar atrás.
                    Por favor, tenha certeza.
                  </p>
                  <button
                    data-testid="profile-delete-button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir conta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Excluir Conta
            </h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                data-testid="modal-cancel-delete"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                data-testid="modal-confirm-delete"
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Excluindo..." : "Excluir Conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeuPerfil;
