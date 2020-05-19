import React from "react"

import _document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document"

import {ServerStyleSheets} from "@material-ui/core/styles"

export default class Document extends _document {
  render(): JSX.Element {
    return (
      <Html lang={"en"}>
        <Head>
          <link
            href={
              "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
            }
            rel={"stylesheet"}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
Document.getInitialProps = async (ctx): Promise<DocumentInitialProps> => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets()
  const originalRenderPage = ctx.renderPage

  ctx.renderPage = (): ReturnType<DocumentContext["renderPage"]> =>
    originalRenderPage({
      enhanceApp: (App) => (props): ReturnType<ServerStyleSheets["collect"]> =>
        sheets.collect(<App {...props} />),
    })

  const initialProps = await _document.getInitialProps(ctx)

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  }
}
