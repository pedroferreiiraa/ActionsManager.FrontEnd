import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Função para decodificar o JWT
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    console.error("Token inválido");
    return null;
  }
};

const ChangePasswordPage = () => {
  const navigate = useNavigate(); // Para redirecionar após salvar
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Token não encontrado.");
      setLoading(false);
      return;
    }

    // Decodifica o token JWT para obter o userId
    const decodedToken = decodeJWT(token);
    if (!decodedToken) {
      setError("Token inválido.");
      setLoading(false);
      return;
    }

    // Acesse o ID do usuário através do campo correto
    const userId =
      +decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    if (!userId) {
      setError("ID do usuário não encontrado.");
      setLoading(false);
      return;
    }
    fetch("http://192.168.16.194:5002/api/users/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: +userId,
        currentPassword,
        newPassword,
      }),
    })
    .then(async (response) => {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `Erro ao alterar a senha! Status: ${response.status}`);
      }
      navigate("/configuracoes");
    })
    .catch((error) => {
      setError(error.message);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all mt-2"
      >
        Voltar
      </button>
      <h1 className="text-2xl text-gray-600 text-center mb-6">Alterar Senha</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Senha Atual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Nova Senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Carregando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
