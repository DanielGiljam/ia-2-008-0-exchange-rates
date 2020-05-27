import {Theme} from "@material-ui/core/styles"

import {breakpoint} from "./constants"
import enhanceResponsiveHeader from "./enhanceResponsiveHeader"

const createTheme = (theme: Theme): Theme => {
  const maxWidth = theme.breakpoints.values[breakpoint]
  const minHeight = maxWidth * 0.75
  const breakpointMediaQuery = `${theme.breakpoints.up(
    breakpoint,
  )} and (min-height: ${minHeight}px)`
  const {toolbarCompensation, MuiAppBar, MuiToolbar} = enhanceResponsiveHeader(
    theme,
    breakpointMediaQuery,
  )
  const mainBorder = `1px solid ${theme.palette.divider}`
  theme.overrides = {
    MuiCssBaseline: {
      "@global": {
        "html, body": {height: "100%"},
        body: {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          [breakpointMediaQuery]: {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
          },
        },
        "#__next": {
          alignItems: "inherit",
          display: "inherit",
          flexDirection: "inherit",
          justifyContent: "inherit",
          height: "100%",
          width: "100%",
          [breakpointMediaQuery]: {
            height: "unset",
            minHeight,
            maxWidth,
          },
        },
        main: {
          alignItems: "inherit",
          background: theme.palette.background.paper,
          display: "inherit",
          flexDirection: "inherit",
          justifyContent: "inherit",
          height: "100%",
          width: "100%",
          ...toolbarCompensation,
          [breakpointMediaQuery]: {
            ...(toolbarCompensation[breakpointMediaQuery] as object),
            borderBottom: mainBorder,
            borderLeft: mainBorder,
            borderRight: mainBorder,
          },
        },
      },
    },
    MuiAppBar: {
      ...MuiAppBar,
    },
    MuiToolbar: {
      ...MuiToolbar,
    },
  }
  return theme
}

export default createTheme
