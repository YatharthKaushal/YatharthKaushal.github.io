// Edit everything about "you" here. SEO metadata, JSON-LD, llms.txt and share images all read from this file.
export const site = {
  // Your domain (no trailing slash). Canonical URLs, sitemap and share cards depend on it.
  url: 'https://yatharthkaushal.github.io',
  name: 'Yatharth Kaushal',
  title: 'Yatharth Kaushal',
  signature: 'theyatharthk',
  description: 'Engineer at Synquic Labs, 3+ years in the industry. Writing on low level systems, networking, datacenters and quant.',
  // Line under the name on the home page: role | experience.
  role: 'I am a Tech Lead',
  experience: '3+ years',
  // One string per paragraph on the home page.
  intro: [
    "I'm a founding engineer at Synquic Labs, a small product and services studio, where I sit just below the founders and do whatever the problem needs: architect backends, lead project teams, ship apps, and run product research.",
    'A couple thousand commits across health tech, edtech, ecommerce and anti counterfeiting projects taught me the stack is rarely the hard part. These days I build in Rust and drift toward what actually interests me: low level systems, networking, datacenters and quant.',
  ],
  locale: 'en_US',
  author: {
    name: 'Yatharth Kaushal',
    jobTitle: 'Engineer & Project Lead',
    worksFor: { name: 'Synquic Labs', url: 'https://synquic.com' },
    twitter: '@theyatharthk',
    email: 'yatharthkaushal@proton.me',
    // Topics you want search and AI engines to associate with you
    knowsAbout: [
      'Low-level systems',
      'Computer networking',
      'Datacenter infrastructure',
      'Quantitative trading systems',
      'Rust',
      'Backend architecture',
      'Application security',
      'Product management',
    ],
  },
  // handle: shown beside the links on hover. Email copies its address on click.
  links: [
    { label: 'GitHub', handle: 'YatharthKaushal', icon: 'github', href: 'https://github.com/YatharthKaushal' },
    { label: 'X', handle: '@theyatharthk', icon: 'x', href: 'https://x.com/theyatharthk' },
    { label: 'LinkedIn', handle: 'Yatharth Kaushal', icon: 'linkedin', href: 'https://www.linkedin.com/in/yatharth-kaushal-7587192a6' },
    { label: 'Email', handle: 'yatharthkaushal@proton.me', icon: 'mail', href: 'mailto:yatharthkaushal@proton.me' },
  ] as const,
};

/** Public profile URLs (for JSON-LD sameAs). */
export const profiles = site.links.map((l) => l.href).filter((h) => h.startsWith('http'));
