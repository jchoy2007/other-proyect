"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Necesito conocimientos tecnicos para usar el bot?",
    answer:
      "No, para nada. Nosotros nos encargamos de toda la configuracion e instalacion. Tu solo nos das la informacion de tu negocio (menu, precios, horarios, etc.) y nosotros hacemos el resto. Tendras un panel super sencillo para ver estadisticas y hacer ajustes.",
  },
  {
    question: "Cuanto tiempo toma la instalacion?",
    answer:
      "Tu bot estara listo y funcionando en maximo 48 horas despues de que nos envies la informacion de tu negocio. En muchos casos lo tenemos listo el mismo dia.",
  },
  {
    question: "El bot reemplaza a mis empleados?",
    answer:
      "No los reemplaza, los libera. El bot se encarga de las preguntas repetitivas y tareas rutinarias (precios, horarios, tomar pedidos basicos). Tus empleados se enfocan en lo que realmente importa: atencion personalizada y cerrar ventas complejas. Ademas, si el bot detecta que el cliente necesita ayuda humana, transfiere la conversacion automaticamente.",
  },
  {
    question: "Que pasa si el bot no sabe responder algo?",
    answer:
      "El bot esta entrenado con la informacion especifica de tu negocio. Si recibe una pregunta que no puede responder, automaticamente notifica a tu equipo y transfiere la conversacion para que un humano la atienda. Nunca dejamos a un cliente sin respuesta.",
  },
  {
    question: "Puedo cancelar cuando quiera?",
    answer:
      "Si, no hay contratos a largo plazo. Puedes cancelar tu suscripcion mensual en cualquier momento. Solo pedimos un aviso con 15 dias de anticipacion.",
  },
  {
    question: "Funciona con mi numero de WhatsApp actual?",
    answer:
      "Si, conectamos el bot a tu numero de WhatsApp Business existente. Si aun no tienes WhatsApp Business, te ayudamos a configurarlo sin costo adicional.",
  },
  {
    question: "Cuantos mensajes puede manejar el bot?",
    answer:
      "Depende de tu plan. El plan Starter incluye 500 conversaciones/mes, el Profesional 2,000 y el Enterprise es ilimitado. Una conversacion incluye todos los mensajes intercambiados con un cliente en un periodo de 24 horas.",
  },
  {
    question: "Es seguro? Mis datos estan protegidos?",
    answer:
      "Absolutamente. Usamos encriptacion de extremo a extremo, la misma que usa WhatsApp. Los datos de tus clientes estan protegidos y nunca compartimos informacion con terceros. Cumplimos con todas las politicas de privacidad de Meta/WhatsApp.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos todas tus dudas
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
