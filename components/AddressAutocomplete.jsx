"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

export default function AddressAutocomplete({ placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    if (value === selectedValue || value.trim().length < 3) { setSuggestions([]); return; }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/maps/autocomplete?q=${encodeURIComponent(value)}`, {
          headers: await authHeaders(), signal: controller.signal,
        });
        const data = await response.json();
        setSuggestions(response.ok ? data.suggestions || [] : []);
      } catch (error) {
        if (error.name !== "AbortError") setSuggestions([]);
      } finally { setLoading(false); }
    }, 300);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [value]);

  async function choose(suggestion) {
    setSuggestions([]);
    const response = await fetch(`/api/maps/place?placeId=${encodeURIComponent(suggestion.placeId)}`, { headers: await authHeaders() });
    const place = await response.json();
    if (!response.ok) { alert(place.error || "Adresse introuvable."); return; }
    setSelectedValue(place.address);
    onChange(place.address);
    onSelect(place);
  }

  return <div className="relative">
    <input required type="text" placeholder={placeholder} value={value}
      onChange={(event) => { setSelectedValue(""); onChange(event.target.value); onSelect(null); }}
      autoComplete="off"
      className="w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600" />
    {loading && <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">Recherche…</span>}
    {suggestions.length > 0 && <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-emerald-100">
      {suggestions.map((suggestion) => <button key={suggestion.placeId} type="button" onClick={() => choose(suggestion)}
        className="block w-full border-b border-slate-100 px-5 py-3 text-left text-sm font-bold text-slate-700 last:border-0 hover:bg-emerald-50">
        {suggestion.label}
      </button>)}
    </div>}
  </div>;
}

export { authHeaders };
