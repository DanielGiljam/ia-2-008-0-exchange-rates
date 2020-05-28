# IA-2-008 (0) Exchange Rates

A web app that shows exchange rates for cryptocurrencies.

Made in the course "Visualisering av information (2019-20) (IA-2-008 (0))" at [Arcada University of Applied Sciences](https://www.arcada.fi/en).

## Get started

1. Clone this repository

```bash
git clone https://github.com/DanielGiljam/ia-2-008-0-exchange-rates.git
```

2. Run `npm install` (in the root of the repository)

```bash
cd ia-2-008-0-exchange-rates
npm install
```

3. Start the development server by running `npm run dev`

```bash
npm run dev
```

4. Go to [http://localhost:3000](http://localhost:3000/) in your web browser

## Features

- Responsive UI
- Elegant UX
- Virtualized autocomplete field for selecting cryptocurrency

## Technical Details

- Accessibility
  - Semantic HTML
  - ARIA attributes for supporting screen readers on custom elements
  - Keyboard navigation support
- Static
  - Can be deployed as a static website (see [`next export`](https://nextjs.org/docs/advanced-features/static-html-export))
- Statically analyzable
  - Source code is written in [TypeScript](https://www.typescriptlang.org/)
- Strict code quality standards
  - Consistent style and best practices are enforced by [ESLint](https://eslint.org/) in combination with [Prettier](https://prettier.io/)
  - The [ESLint](https://eslint.org/) configuration extends [JavaScript Standard Style](https://standardjs.com/)
- Powered by [Next.js](https://nextjs.org/)
  - Delightful developer experience
    - Clean source code repository structure
    - Hot code reloading development server
  - Production-grade [webpack](https://webpack.js.org/) pipeline
    - Tree-shaking
    - Code-splitting
- Powered by [React](https://reactjs.org/)
- Powered by [Material-UI](https://material-ui.com/)
