// Edit everything about "you" here. SEO metadata, JSON-LD, llms.txt and share images all read from this file.
export const site = {
  // Your domain (no trailing slash). Canonical URLs, sitemap and share cards depend on it.
  url: 'https://yatharthkaushal.github.io',
  name: 'Yatharth Kaushal',
  title: 'Yatharth Kaushal',
  signature: 'theyatharthk',
  description: 'Engineer at Synquic Labs. Writing on low-level systems, networking, datacenters and quant.',
  intro:
    "I'm an engineer at Synquic Labs, a small product studio, where I sit just below the founders and do whatever the problem needs: architect backends, lead project teams of 5–10, ship apps, and run product research. A couple thousand commits across health-tech, commerce, IoT and anti-counterfeiting taught me the stack is rarely the hard part. These days I build in Rust and drift toward what actually interests me: low-level systems, networking, datacenters and quant. This is where I write about it.",
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
  links: [
    { label: 'GitHub', icon: 'github', href: 'https://github.com/YatharthKaushal' },
    { label: 'X', icon: 'x', href: 'https://x.com/theyatharthk' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/yatharth-kaushal-7587192a6' },
    { label: 'Email', icon: 'mail', href: 'mailto:yatharthkaushal@proton.me' },
  ] as const,
};

/** Public profile URLs (for JSON-LD sameAs). */
export const profiles = site.links.map((l) => l.href).filter((h) => h.startsWith('http'));
