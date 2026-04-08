"use client";

import { useState } from "react";

export function CTA() {
  const [formData, setFormData] = useState({
    name: "",
    business: "",
    phone: "",
    industry: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Build WhatsApp message with form data
    const text = encodeURIComponent(
      `Hola! Me interesa el bot de WhatsApp para mi negocio.\n\nNombre: ${formData.name}\nNegocio: ${formData.business}\nIndustria: ${formData.industry}\nMensaje: ${formData.message}`
    );
    // Replace with your actual WhatsApp number
    window.open(`https://wa.me/1234567890?text=${text}`, "_blank");
    setSubmitted(true);
  }

  return (
    <section
      id="contacto"
      className="py-16 sm:py-24 bg-gradient-to-br from-green-wa to-green-wa-dark"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Listo para que tu negocio venda 24/7?
            </h2>
            <p className="text-lg text-green-100 mb-8">
              Deja tus datos y te contactamos en menos de 2 horas con una demo
              personalizada para tu negocio. Sin compromiso.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>Demo gratis personalizada para tu negocio</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>Setup completo en 48 horas</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>Sin contratos ni compromisos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-wa"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Mensaje enviado!
                </h3>
                <p className="text-gray-600">
                  Te contactaremos en menos de 2 horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Solicita tu demo gratis
                </h3>
                <div>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-wa focus:ring-2 focus:ring-green-wa/20 outline-none transition-colors"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Nombre de tu negocio"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-wa focus:ring-2 focus:ring-green-wa/20 outline-none transition-colors"
                    value={formData.business}
                    onChange={(e) =>
                      setFormData({ ...formData, business: e.target.value })
                    }
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Tu WhatsApp (con codigo de pais)"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-wa focus:ring-2 focus:ring-green-wa/20 outline-none transition-colors"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-wa focus:ring-2 focus:ring-green-wa/20 outline-none transition-colors text-gray-500"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                  >
                    <option value="">Tipo de negocio</option>
                    <option value="restaurante">Restaurante / Comida</option>
                    <option value="clinica">Clinica / Consultorio</option>
                    <option value="inmobiliaria">Inmobiliaria</option>
                    <option value="tienda">Tienda / E-commerce</option>
                    <option value="servicios">Servicios profesionales</option>
                    <option value="salon">Salon de belleza / Spa</option>
                    <option value="gimnasio">Gimnasio / Fitness</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Cuentanos que necesita tu negocio (opcional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-wa focus:ring-2 focus:ring-green-wa/20 outline-none transition-colors resize-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-wa text-white py-4 rounded-lg font-bold text-lg hover:bg-green-wa-dark transition-colors"
                >
                  Quiero mi Demo Gratis
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Al enviar, te redirigiremos a WhatsApp para confirmar tu
                  solicitud.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
