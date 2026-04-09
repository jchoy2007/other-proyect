"use client";

import { useState } from "react";
import { BUSINESS, SOFTWARE_PRODUCTS, DESK_PRODUCTS, ALL_PRODUCTS } from "@/lib/synovatech-data";

interface Order {
  id: string;
  product: string;
  productId: string;
  customer: string;
  phone: string;
  amount: number;
  paymentMethod: string;
  deliveryType: string;
  address: string;
  status: "cotizacion" | "pagado" | "enviado" | "entregado" | "cancelado";
  date: string;
  notes: string;
}

const demoOrders: Order[] = [
  { id: "ST-001234", product: "Office Pro Plus 2024", productId: "office-2024", customer: "Carlos Mendoza", phone: "+507 6555-1234", amount: 45, paymentMethod: "Yappy", deliveryType: "Digital", address: "carlos@email.com", status: "cotizacion", date: "2026-04-09 10:30", notes: "Esperando comprobante" },
  { id: "ST-001235", product: "Mesa Gamer H2 (LED)", productId: "mesa-h2-led", customer: "Ana Rodriguez", phone: "+507 6777-5678", amount: 110, paymentMethod: "ACH", deliveryType: "Contra entrega", address: "El Cangrejo, Calle 50, Edif. Plaza", status: "pagado", date: "2026-04-09 09:15", notes: "Pago confirmado, coordinar entrega" },
  { id: "ST-001236", product: "Windows 11 Pro OEM", productId: "win11-pro-oem", customer: "Roberto Torres", phone: "+507 6888-9999", amount: 12, paymentMethod: "Yappy", deliveryType: "Digital", address: "roberto@gmail.com", status: "pagado", date: "2026-04-08 16:45", notes: "Clave enviada" },
  { id: "ST-001237", product: "Mesa Electrica S60", productId: "mesa-s60-led", customer: "Maria Gonzalez", phone: "+507 6444-3333", amount: 145, paymentMethod: "Yappy", deliveryType: "Interior", address: "David, Chiriquí - Barrio Bolívar, casa #12", status: "enviado", date: "2026-04-08 11:00", notes: "Enviado por Red Servi - Tracking #RS29384" },
  { id: "ST-001238", product: "Office Pro Plus 2021", productId: "office-2021", customer: "Juan Herrera", phone: "+507 6222-1111", amount: 25, paymentMethod: "ACH", deliveryType: "Digital", address: "juanh@outlook.com", status: "entregado", date: "2026-04-07 14:20", notes: "Clave entregada + instalación remota" },
];

const statusColors: Record<string, string> = {
  cotizacion: "bg-amber-500/20 text-amber-400",
  pagado: "bg-green-500/20 text-green-400",
  enviado: "bg-blue-500/20 text-blue-400",
  entregado: "bg-gray-500/20 text-gray-400",
  cancelado: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  cotizacion: "Cotización",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function SynovaTechAdmin() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "settings">("orders");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const stats = {
    cotizaciones: orders.filter((o) => o.status === "cotizacion").length,
    pagados: orders.filter((o) => o.status === "pagado").length,
    enviados: orders.filter((o) => o.status === "enviado").length,
    totalVentas: orders.filter((o) => o.status !== "cotizacion" && o.status !== "cancelado").reduce((s, o) => s + o.amount, 0),
  };

  function updateOrderStatus(orderId: string, newStatus: Order["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="bg-[#0d1d33] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">ST</div>
            <div>
              <h1 className="font-bold">SynovaTech <span className="text-cyan-400">Admin</span></h1>
              <p className="text-xs text-gray-500">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">{BUSINESS.email}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-5">
            <p className="text-xs text-gray-400">Cotizaciones pendientes</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{stats.cotizaciones}</p>
          </div>
          <div className="bg-white/5 border border-green-500/20 rounded-xl p-5">
            <p className="text-xs text-gray-400">Pagos confirmados</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{stats.pagados}</p>
          </div>
          <div className="bg-white/5 border border-blue-500/20 rounded-xl p-5">
            <p className="text-xs text-gray-400">En tránsito</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{stats.enviados}</p>
          </div>
          <div className="bg-white/5 border border-cyan-500/20 rounded-xl p-5">
            <p className="text-xs text-gray-400">Ventas totales</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">${stats.totalVentas.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "orders" as const, label: "Pedidos", icon: "📋" },
            { id: "products" as const, label: "Productos", icon: "📦" },
            { id: "settings" as const, label: "Configuración", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* === PEDIDOS === */}
        {activeTab === "orders" && (
          <div>
            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", "cotizacion", "pagado", "enviado", "entregado", "cancelado"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-white"}`}
                >
                  {s === "all" ? "Todos" : statusLabels[s]} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
                </button>
              ))}
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 ${selectedOrder?.id === order.id ? "border-cyan-500/50" : "border-white/10"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center text-lg">
                        {order.deliveryType === "Digital" ? "💿" : "🖥️"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{order.product}</p>
                        <p className="text-xs text-gray-400">{order.customer} • {order.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <p className="text-lg font-bold text-cyan-400 mt-1">${order.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Orden</p>
                          <p className="font-mono text-cyan-400">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Fecha</p>
                          <p>{order.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Método de pago</p>
                          <p>{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Tipo de entrega</p>
                          <p>{order.deliveryType}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-gray-500 text-xs">Dirección / Email</p>
                          <p>{order.address}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-gray-500 text-xs">Notas</p>
                          <p className="text-gray-300">{order.notes}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {order.status === "cotizacion" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "pagado"); }}
                            className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500/30"
                          >
                            ✅ Confirmar pago
                          </button>
                        )}
                        {order.status === "pagado" && order.deliveryType === "Digital" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "entregado"); }}
                            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/30"
                          >
                            📧 Marcar como entregado
                          </button>
                        )}
                        {order.status === "pagado" && order.deliveryType !== "Digital" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "enviado"); }}
                            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/30"
                          >
                            🚚 Marcar como enviado
                          </button>
                        )}
                        {order.status === "enviado" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "entregado"); }}
                            className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-500/30"
                          >
                            📦 Marcar como entregado
                          </button>
                        )}
                        {(order.status === "pagado" || order.status === "entregado") && (
                          <a
                            href={`/synovatech/factura?id=${order.productId}&order=${order.id}&type=factura`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/30"
                          >
                            🧾 Ver factura
                          </a>
                        )}
                        {order.status === "cotizacion" && (
                          <a
                            href={`/synovatech/factura?id=${order.productId}&order=${order.id}&type=cotizacion`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/30"
                          >
                            📄 Ver cotización
                          </a>
                        )}
                        {order.status === "cotizacion" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "cancelado"); }}
                            className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30"
                          >
                            ❌ Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PRODUCTOS === */}
        {activeTab === "products" && (
          <div>
            <h2 className="text-lg font-bold mb-4">Software ({SOFTWARE_PRODUCTS.length} productos)</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs">
                    <th className="text-left p-3">Producto</th>
                    <th className="text-left p-3">Categoría</th>
                    <th className="text-right p-3">Precio</th>
                    <th className="text-center p-3">Imagen</th>
                  </tr>
                </thead>
                <tbody>
                  {SOFTWARE_PRODUCTS.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-gray-400">{p.subcategory}</td>
                      <td className="p-3 text-right text-cyan-400 font-bold">${p.price.toFixed(2)}</td>
                      <td className="p-3 text-center text-gray-500 text-xs">Digital</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold mb-4">Mesas ({DESK_PRODUCTS.length} productos)</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs">
                    <th className="text-left p-3">Producto</th>
                    <th className="text-left p-3">Dimensiones</th>
                    <th className="text-right p-3">Precio</th>
                    <th className="text-center p-3">Imagen</th>
                  </tr>
                </thead>
                <tbody>
                  {DESK_PRODUCTS.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-gray-400 text-xs">{p.dimensions}</td>
                      <td className="p-3 text-right text-purple-400 font-bold">${p.price.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <label className="cursor-pointer bg-purple-500/20 text-purple-400 px-3 py-1 rounded text-xs hover:bg-purple-500/30">
                          📷 Subir
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) alert(`Imagen "${file.name}" seleccionada para ${p.name}.\n\nEn producción, esto subiría la imagen al servidor y la conectaría al producto.`);
                          }} />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === CONFIGURACIÓN === */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-4">Información del Negocio</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400">Nombre</label>
                  <input defaultValue={BUSINESS.fullName} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Tagline</label>
                  <input defaultValue={BUSINESS.tagline} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">WhatsApp</label>
                  <input defaultValue={BUSINESS.whatsappDisplay} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Email</label>
                  <input defaultValue={BUSINESS.email} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Instagram</label>
                  <input defaultValue={BUSINESS.instagram} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-4">Métodos de Pago</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400">Yappy #1</label>
                  <input defaultValue={`${BUSINESS.payment.yappy[0].number} (${BUSINESS.payment.yappy[0].name})`} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Yappy #2</label>
                  <input defaultValue={`${BUSINESS.payment.yappy[1].number} (${BUSINESS.payment.yappy[1].name})`} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Banco</label>
                  <input defaultValue={BUSINESS.payment.ach.bank} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Número de cuenta</label>
                  <input defaultValue={BUSINESS.payment.ach.account} className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-4">Logo de la Empresa</h3>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <span className="text-4xl">🖼️</span>
                <p className="text-gray-400 text-sm mt-2">Arrastra tu logo aquí o haz click para seleccionar</p>
                <label className="mt-3 inline-block cursor-pointer bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-sm hover:bg-cyan-500/30">
                  Seleccionar archivo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) alert(`Logo "${file.name}" seleccionado.\n\nEn producción, esto actualizaría el logo en toda la web.`);
                  }} />
                </label>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-4">Horarios de Entrega</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400">Días de entrega (Ciudad de Panamá)</label>
                  <input defaultValue="Lunes, Miércoles y Viernes" className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Horario de entrega</label>
                  <input defaultValue="10:00am - 3:00pm" className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Bodega - Horario L-V</label>
                  <input defaultValue="9:00am - 5:30pm" className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Bodega - Horario Sábado</label>
                  <input defaultValue="9:00am - 2:00pm" className="w-full mt-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-cyan-500" />
                </div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500">
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
