import {useEffect} from "react"

import {AppProps} from "next/app"

import CssBaseline from "@material-ui/core/CssBaseline"
import {LocalizationProvider} from "@material-ui/pickers"

import {
  ThemeProvider,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"

import MomentUtils from "@date-io/moment"
import moment from "moment"

import Header from "../src/components/Header"
import createTheme from "../src/theme/createTheme"

const App = ({Component, pageProps}: AppProps): JSX.Element => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])
  moment.locale("en")
  return (
    <LocalizationProvider dateAdapter={MomentUtils}>
      <ThemeProvider theme={createTheme(responsiveFontSizes(createMuiTheme()))}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Header />
        <main>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
