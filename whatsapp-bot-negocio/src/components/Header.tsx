"use client";

import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-wa rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.798-6.384-2.147l-.144-.108-3.094 1.038 1.038-3.094-.108-.144A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Bot<span className="text-green-wa">Ventas</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#como-funciona"
              className="text-sm text-gray-600 hover:text-green-wa transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#funcionalidades"
              className="text-sm text-gray-600 hover:text-green-wa transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#precios"
              className="text-sm text-gray-600 hover:text-green-wa transition-colors"
            >
              Precios
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-600 hover:text-green-wa transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contacto"
              className="bg-green-wa text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-wa-dark transition-colors"
            >
              Quiero mi Bot
            </a>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <a
              href="#como-funciona"
              className="text-sm text-gray-600 hover:text-green-wa"
            >
              Como Funciona
            </a>
            <a
              href="#funcionalidades"
              className="text-sm text-gray-600 hover:text-green-wa"
            >
              Funcionalidades
            </a>
            <a
              href="#precios"
              className="text-sm text-gray-600 hover:text-green-wa"
            >
              Precios
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-600 hover:text-green-wa"
            >
              FAQ
            </a>
            <a
              href="#contacto"
              className="bg-green-wa text-white px-6 py-2 rounded-full text-sm font-semibold text-center"
            >
              Quiero mi Bot
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
