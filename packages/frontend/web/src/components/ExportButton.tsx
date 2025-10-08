import { Button } from "./ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  filters?: Record<string, string>;
  label?: string;
}

export function ExportButton({ endpoint, filename, filters = {}, label = "Exporter CSV" }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Non authentifié");
        return;
      }

      // Build query params
      const queryParams = new URLSearchParams(filters);
      const url = `${import.meta.env.VITE_API_URL}${endpoint}?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert("Erreur lors de l'export");
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
