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
    mermaid: true,   // Diagramme aus ```mermaid-Codeblöcken, passend zu hellem und dunklem Design
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      // Volltextsuche, die ohne Server und offline funktioniert (Index wird beim Build erzeugt)
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['de'],
        docsRouteBasePath: 'lernen',
        indexBlog: false,
        indexPages: true,
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 12,
        searchBarShortcutHint: false,
      },
    ],
  ],

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
    // Stichwortverzeichnis A–Z unter /stichwortverzeichnis, beim Build aus allen Lektionen erzeugt
    './plugins/stichwortverzeichnis.cjs',
    // Erlaubt "import fragen from './x.fragen.yaml'" in MDX-Dateien.
    // Fragen-Dateien laufen durch einen eigenen Loader, der Lektion, Bereich und Seite ergänzt.
    function yamlLoaderPlugin(context) {
      return {
        name: 'yaml-loader-plugin',
        configureWebpack() {
          return {
            module: {
              rules: [
                {test: /\.fragen\.yaml$/, use: `${context.siteDir}/plugins/fragen-loader.cjs`},
                {test: /\.ya?ml$/, exclude: /\.fragen\.yaml$/, use: 'yaml-loader'},
              ],
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
          {to: '/wiederholen', label: '🔁 Wiederholen', position: 'left'},
          {to: '/stichwortverzeichnis', label: '📇 Index', position: 'left'},
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
        additionalLanguages: ['csharp', 'java', 'bash', 'docker', 'yaml', 'json', 'powershell', 'gherkin', 'sql'],
      },
    }),
};

export default config;
