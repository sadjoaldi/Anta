const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:4000'; // Remplacez par l'IP locale du serveur

export async function ping() {
  try {
    const res = await fetch(`${API_URL}/api/health`);
    return res.json();
  } catch (e) {
    return { ok: false, error: e?.message };
  }
}

export default { ping };
