import Head from "next/head"
import NextLink from "next/link"

import AppBar from "@material-ui/core/AppBar"
import IconButton from "@material-ui/core/IconButton"
import MuiLink from "@material-ui/core/Link"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import GitHubIcon from "@material-ui/icons/GitHub"
import InfoRoundedIcon from "@material-ui/icons/InfoRounded"

import {createStyles, makeStyles} from "@material-ui/core/styles"

const sourceCodeURL =
  "https://github.com/DanielGiljam/ia-2-008-0-exchange-rates"

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      flexGrow: 1,
    },
    linkFocusVisible: {
      outline: "unset",
      textDecoration: "underline",
    },
  }),
)

const Header = (): JSX.Element => {
  const styles = useStyles()
  return (
    <>
      <Head>
        <title>IA-2-008 (0) Exchange Rates</title>
        <meta
          content={"A web app that shows exchange rates for cryptocurrencies."}
          name={"description"}
        />
      </Head>
      <AppBar elevation={0}>
        <Toolbar>
          <Typography
            className={styles.link}
            component={"h1"}
            variant={"h6"}
            noWrap
          >
            <NextLink href={{pathname: "/"}} passHref>
              <MuiLink
                classes={{focusVisible: styles.linkFocusVisible}}
                color={"inherit"}
              >
                IA-2-008 (0) Exchange Rates
              </MuiLink>
            </NextLink>
          </Typography>
          <NextLink href={{pathname: "/about"}} passHref>
            <IconButton aria-label={"About"} color={"inherit"} component={"a"}>
              <InfoRoundedIcon />
            </IconButton>
          </NextLink>
          <IconButton
            aria-label={"Link to repository on GitHub"}
            color={"inherit"}
            component={"a"}
            edge={"end"}
            href={sourceCodeURL}
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default Header
