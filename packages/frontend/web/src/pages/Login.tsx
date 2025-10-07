import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(phone, password);
      
      // Check if user is admin
      if (response.user.role !== 'admin') {
        setError("Accès refusé. Seuls les administrateurs peuvent se connecter.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Échec de la connexion. Vérifiez vos identifiants.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Admin ANTA</CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            Tableau de bord administrateur
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Téléphone</label>
              <Input 
                placeholder="+224 ..." 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
