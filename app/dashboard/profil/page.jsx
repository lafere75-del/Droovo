export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl shadow-sm p-8">
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">

            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
              E
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Eulalie Zegzula
              </h1>

              <p className="text-gray-500 mt-1">
                Lyon, France
              </p>

              <div className="flex gap-3 mt-4 flex-wrap">
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                  Profil vérifié
                </div>

                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
                  4.9/5 de note
                </div>
              </div>
            </div>

            <button className="bg-black text-white px-5 py-3 rounded-2xl font-medium hover:opacity-90 transition">
              Modifier le profil
            </button>

          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-6">

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              Livraisons effectuées
            </p>

            <h2 className="text-3xl font-bold mt-2">
              24
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              Colis envoyés
            </p>

            <h2 className="text-3xl font-bold mt-2">
              12
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              Revenus générés
            </p>

            <h2 className="text-3xl font-bold mt-2">
              438 €
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 mt-6">

          <h2 className="text-2xl font-bold mb-6">
            Informations personnelles
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="text-sm text-gray-500">
                Nom complet
              </label>

              <input
                type="text"
                value="Eulalie Zegzula"
                readOnly
                className="w-full mt-2 bg-gray-100 rounded-2xl p-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Email
              </label>

              <input
                type="text"
                value="eulaliezegzula@gmail.com"
                readOnly
                className="w-full mt-2 bg-gray-100 rounded-2xl p-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Téléphone
              </label>

              <input
                type="text"
                value="+33 6 00 00 00 00"
                readOnly
                className="w-full mt-2 bg-gray-100 rounded-2xl p-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Ville
              </label>

              <input
                type="text"
                value="Lyon"
                readOnly
                className="w-full mt-2 bg-gray-100 rounded-2xl p-4 outline-none"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
