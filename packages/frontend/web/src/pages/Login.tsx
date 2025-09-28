import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin ANTA</h1>
          <p className="text-gray-500">
            Connectez-vous pour accéder au dashboard
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/dashboard");
          }}
        >
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Email</label>
            <Input placeholder="you@example.com" type="email" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Mot de passe</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Se connecter</Button>
        </form>
        <div className="text-sm text-center text-gray-600">
          Pas de compte ?{" "}
          <Link className="text-green-700 hover:underline" to="#">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
