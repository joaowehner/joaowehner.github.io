// ─────────────────────────────────────────────────────────────
// Fonte única de conteúdo do site. Edite aqui — os componentes
// e o terminal leem tudo deste arquivo.
// ─────────────────────────────────────────────────────────────

export interface SocialLink {
  id: string
  label: string
  handle: string
  url: string
  /** Ação exibida na central de links */
  action: 'abrir' | 'copiar'
}

export type ProjectStatus = 'em produção' | 'em evolução' | 'privado'

export interface Project {
  id: string
  /** Caminho fictício exibido no card, ex.: ~/projects/tsw-plataforma */
  path: string
  name: string
  tagline: string
  description: string
  role: string
  tech: string[]
  status: ProjectStatus
  url?: string
  urlLabel?: string
  /** Texto do rodapé do card quando não há URL */
  footerNote?: string
}

export interface StackGroup {
  id: string
  title: string
  note: string
  items: string[]
}

export interface Profile {
  brand: string
  fullName: string
  displayName: string
  role: string
  headline: string
  subheadline: string
  location: string
  company: { name: string; url: string }
  about: string[]
  email: string
  /** Link wa.me completo; omita para esconder o CTA de WhatsApp */
  whatsappUrl?: string
  social: SocialLink[]
  projects: Project[]
  stack: StackGroup[]
  siteUrl: string
  sourceUrl?: string
}

export const profile: Profile = {
  brand: 'joaowehner',
  fullName: 'João Guilherme Wehner Ricartes',
  displayName: 'João Guilherme',
  role: 'Desenvolvedor Full-Stack e CEO',
  headline: 'Construo e ofereço soluções tecnológicas para o mercado imobiliário.',
  subheadline:
    'Sócio e Co-CEO no Grupo Wehner e na TSW Soluções Inteligentes. Lidero a operação e a tecnologia das empresas, cuidando dos sites, das integrações e da automação de leads, do código ao deploy com React, TypeScript e Node.',
  location: 'Campo Grande · MS, Brasil',
  company: {
    name: 'TSW Soluções Inteligentes',
    url: 'https://tswsolucoesinteligentes.com.br',
  },
  about: [
    'Sou desenvolvedor full-stack e Co-CEO na TSW Soluções Inteligentes e no Grupo Wehner, ecossistema de negócios e tecnologia imobiliária em Campo Grande. Liderar a operação muda o jeito de programar: cada decisão técnica aqui também é uma decisão de negócio.',
    'Na prática, isso se traduz em sites em produção, integrações que centralizam a captação de leads e fluxos de atendimento automatizados com IA, tudo mantido de ponta a ponta por mim, do layout ao deploy.',
    'Este site é parte desse ecossistema: construído do zero com React e TypeScript, sem template e com o código aberto no GitHub.',
  ],
  email: 'joaowehner@gmail.com',
  whatsappUrl: 'https://wa.me/5567998575834',
  social: [
    {
      id: 'github',
      label: 'GitHub',
      handle: 'joaowehner',
      url: 'https://github.com/joaowehner',
      action: 'abrir',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      handle: 'in/joaowehner',
      url: 'https://www.linkedin.com/in/joaowehner',
      action: 'abrir',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@joaowehner',
      url: 'https://www.instagram.com/joaowehner',
      action: 'abrir',
    },
    {
      id: 'tsw',
      label: 'TSW Soluções Inteligentes',
      handle: 'tswsolucoesinteligentes.com.br',
      url: 'https://tswsolucoesinteligentes.com.br',
      action: 'abrir',
    },
    {
      id: 'email',
      label: 'E-mail',
      handle: 'joaowehner@gmail.com',
      url: 'mailto:joaowehner@gmail.com',
      action: 'copiar',
    },
  ],
  projects: [
    {
      id: 'tsw-plataforma',
      path: '~/projects/tsw-plataforma',
      name: 'TSW — Site institucional',
      tagline: 'O site da consultoria da qual sou sócio',
      description:
        'Presença digital da TSW: serviços, metodologia e captação de clientes para consultoria de negócios imobiliários, crédito e curadoria de investimentos.',
      role: 'Desenvolvimento completo, do layout ao deploy',
      tech: ['HTML', 'CSS', 'JavaScript', 'Hostinger'],
      status: 'em produção',
      url: 'https://tswsolucoesinteligentes.com.br',
      urlLabel: 'tswsolucoesinteligentes.com.br',
    },
    {
      id: 'tsw-leads',
      path: '~/projects/tsw-leads-bridge',
      name: 'TSW Leads API Bridge',
      tagline: 'Captação de leads sem distribuição manual',
      description:
        'Integração em Node que centraliza leads do site, de formulários e de campanhas e os entrega direto ao fluxo comercial da TSW. O time recebe, ninguém redistribui na mão.',
      role: 'Arquitetura e implementação',
      tech: ['Node.js', 'JavaScript', 'APIs REST'],
      status: 'privado',
      footerNote: 'código privado, detalhes sob conversa',
    },
    {
      id: 'tsw-crm',
      path: '~/projects/tsw-crm',
      name: 'TSW CRM',
      tagline: 'CRM completo para a operação imobiliária da TSW',
      description:
        'Sistema de gestão comercial sob medida para o Grupo Wehner: pipeline de vendas, acompanhamento de clientes, integração com captação de leads e automações internas.',
      role: 'Arquitetura, desenvolvimento e produto',
      tech: ['React', 'TypeScript', 'Node.js', 'Supabase'],
      status: 'em evolução',
      footerNote: 'em desenvolvimento',
    },
    {
      id: 'joaowehner-site',
      path: '~/projects/joaowehner-site',
      name: 'Este site',
      tagline: 'Portfólio-terminal construído do zero, sem template',
      description:
        'Página única em React 19 + TypeScript strict, CSS autoral com design tokens e terminal interativo testado. Lighthouse 99·100·100·100 e deploy contínuo no GitHub Pages.',
      role: 'Design e desenvolvimento completos',
      tech: ['React', 'TypeScript', 'Vite', 'GitHub Actions'],
      status: 'em produção',
      url: 'https://github.com/joaowehner/joaowehner.github.io',
      urlLabel: 'código no GitHub',
    },
  ],
  stack: [
    {
      id: 'principal',
      title: 'principal',
      note: 'uso diário',
      items: ['HTML & CSS', 'JavaScript', 'APIs REST', 'Git & GitHub', 'PostgreSQL', 'Cloud & Deploy', 'Hospedagem & Infra'],
    },
    {
      id: 'pratica',
      title: 'experiência prática',
      note: 'ferramentas do trabalho real',
      items: ['TypeScript', 'React', 'Next.js', 'Node.js'],
    },
    {
      id: 'explorando',
      title: 'explorando',
      note: 'estudo ativo e aplicação gradual',
      items: ['IA aplicada a negócios', 'Automação de atendimento', 'Python'],
    },
  ],
  siteUrl: 'https://joaowehner.github.io/',
  sourceUrl: 'https://github.com/joaowehner/joaowehner.github.io',
}
