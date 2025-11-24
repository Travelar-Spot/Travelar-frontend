import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  MapPinHouse,
} from "lucide-react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "#" },
  { Icon: Instagram, href: "#" },
  { Icon: Twitter, href: "#" },
];

const QUICK_LINKS = [
  { label: "Explorar", to: "/buscar" },
  { label: "Anunciar seu imóvel", to: "/cadastro" },
];

const HELP_LINKS = [
  { label: "Como funciona", href: "#" },
  { label: "Ajuda", href: "#" },
];

const SUPPORT_LINKS = [
  { label: "Central de Ajuda", href: "#" },
  { label: "Política de Cancelamento", href: "#" },
  { label: "Termos de Uso", href: "#" },
  { label: "Privacidade", href: "#" },
];

const CONTACT_INFO = [
  { Icon: Mail, text: "contato@travelar.com" },
  { Icon: Phone, text: "(61) 4002-8922" },
  { Icon: MapPin, text: "Brasília, DF" },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPinHouse className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Travelar</span>
            </div>
            <p className="text-gray-400 mb-4">
              Conectando viajantes a experiências únicas de hospedagem ao redor
              do mundo.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map(({ label, to }, index) => (
                <li key={index}>
                  <Link
                    to={to}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {HELP_LINKS.map(({ label, href }, index) => (
                <li key={`help-${index}`}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map(({ label, href }, index) => (
                <li key={index}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              {CONTACT_INFO.map(({ Icon, text }, index) => (
                <div key={index} className="flex items-center">
                  <Icon className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Travelar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
