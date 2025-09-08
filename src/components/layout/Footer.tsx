'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Github,
  Twitter,
  MessageCircle as Discord,
  Mail,
  Heart,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Recursos', href: '/features' },
      { label: 'Preços', href: '/pricing' },
      { label: 'API', href: '/api' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
    support: [
      { label: 'Central de Ajuda', href: '/help' },
      { label: 'Contato', href: '/contact' },
      { label: 'Status', href: '/status' },
      { label: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { label: 'Privacidade', href: '/privacy' },
      { label: 'Termos', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'DMCA', href: '/dmca' },
    ],
    community: [
      { label: 'Discord', href: 'https://discord.gg/tarkov', external: true },
      { label: 'Reddit', href: 'https://reddit.com/r/EscapefromTarkov', external: true },
      { label: 'Twitter', href: 'https://twitter.com/bstategames', external: true },
      { label: 'GitHub', href: 'https://github.com/secret-tarkov', external: true },
    ],
  };

  const socialLinks = [
    {
      label: 'Discord',
      href: 'https://discord.gg/secret-tarkov',
      icon: <Discord className="w-5 h-5" />,
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/secret-tarkov',
      icon: <Twitter className="w-5 h-5" />,
    },
    {
      label: 'GitHub',
      href: 'https://github.com/secret-tarkov',
      icon: <Github className="w-5 h-5" />,
    },
    {
      label: 'Email',
      href: 'mailto:contact@secret-tarkov.com',
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  const renderLinkSection = (title: string, links: typeof footerLinks.product) => (
    <div>
      <h3 className="font-semibold text-tarkov-light mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tarkov-muted hover:text-tarkov-accent transition-colors duration-200 flex items-center gap-1 group"
              >
                {link.label}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-tarkov-muted hover:text-tarkov-accent transition-colors duration-200"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className={cn(
      'bg-tarkov-secondary/80 border-t border-tarkov-border backdrop-blur-sm',
      className
    )}>
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-tarkov-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-tarkov-light">
                Secret Tarkov
              </span>
            </div>
            
            <p className="text-tarkov-muted mb-6 max-w-md">
              A plataforma definitiva para jogadores de Escape From Tarkov. 
              Acompanhe preços, gerencie inventário e otimize sua gameplay.
            </p>
            
            {/* Features Highlight */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-tarkov-muted">
                <Zap className="w-4 h-4 text-tarkov-accent" />
                <span>Dados em tempo real</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-tarkov-muted">
                <Shield className="w-4 h-4 text-tarkov-accent" />
                <span>100% seguro e confiável</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tarkov-muted hover:text-tarkov-accent transition-colors duration-200 p-2 hover:bg-tarkov-accent/10 rounded-lg"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {renderLinkSection('Produto', footerLinks.product)}
          {renderLinkSection('Suporte', footerLinks.support)}
          {renderLinkSection('Comunidade', footerLinks.community)}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-tarkov-border pt-6 mb-6">
          <div className="bg-tarkov-accent/10 border border-tarkov-accent/20 rounded-lg p-4">
            <p className="text-sm text-tarkov-muted text-center">
              <strong className="text-tarkov-light">Aviso:</strong> Este site não é afiliado à Battlestate Games. 
              Escape From Tarkov é uma marca registrada da Battlestate Games Limited. 
              Todos os dados são obtidos através de APIs públicas.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-tarkov-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-tarkov-muted">
              <span>© {currentYear} Secret Tarkov. Feito com</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>para a comunidade Tarkov.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-tarkov-muted hover:text-tarkov-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* API Attribution */}
        <div className="mt-6 pt-6 border-t border-tarkov-border">
          <div className="text-center">
            <p className="text-xs text-tarkov-muted mb-2">
              Dados fornecidos por:
            </p>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <a
                href="https://tarkov.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-tarkov-muted hover:text-tarkov-accent transition-colors duration-200 flex items-center gap-1"
              >
                tarkov.dev API
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://tarkov-market.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-tarkov-muted hover:text-tarkov-accent transition-colors duration-200 flex items-center gap-1"
              >
                Tarkov Market API
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export type { FooterProps };