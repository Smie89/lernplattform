// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Lernplattform',
  tagline: 'Testautomation · Softwaretest · Entwicklung · Linux · Docker · KI',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages: https://smie89.github.io/lernplattform/
  url: 'https://smie89.github.io',
  baseUrl: '/lernplattform/',
  organizationName: 'Smie89',
  projectName: 'lernplattform',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: 'lernen',
          sidebarPath: './sidebars.js',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    // Erlaubt "import fragen from './x.fragen.yaml'" in MDX-Dateien
    function yamlLoaderPlugin() {
      return {
        name: 'yaml-loader-plugin',
        configureWebpack() {
          return {
            module: {
              rules: [{test: /\.ya?ml$/, use: 'yaml-loader'}],
            },
          };
        },
      };
    },
    [
      '@docusaurus/plugin-pwa',
      {
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString', 'mobile'],
        pwaHead: [
          {tagName: 'link', rel: 'icon', href: '/lernplattform/img/icon-512.png'},
          {tagName: 'link', rel: 'manifest', href: '/lernplattform/manifest.json'},
          {tagName: 'meta', name: 'theme-color', content: '#2e7d5b'},
          {tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes'},
          {tagName: 'link', rel: 'apple-touch-icon', href: '/lernplattform/img/icon-192.png'},
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Lernplattform',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {type: 'docSidebar', sidebarId: 'lernSidebar', position: 'left', label: 'Lernbereiche'},
          {
            href: 'https://github.com/Smie89/lernplattform',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Persönliche Lernplattform · ${new Date().getFullYear()}`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['csharp', 'java', 'bash', 'docker', 'yaml', 'json', 'powershell'],
      },
    }),
};

export default config;
