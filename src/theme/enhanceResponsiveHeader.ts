import {Theme} from "@material-ui/core/styles"
import {BreakpointValues} from "@material-ui/core/styles/createBreakpoints"
import {Overrides} from "@material-ui/core/styles/overrides"
import {CSSProperties} from "@material-ui/core/styles/withStyles"

// These constants come from Material-UI v4.9.8's default theme (2020-04-12)
// See https://material-ui.com/customization/default-theme/
const toolbarLandscapeMediaQuery =
  "@media (min-width:0px) and (orientation: landscape)"
const toolbarUndenseBreakpoint: keyof BreakpointValues = "sm"
const toolbarDefaultPaddingMultiplier = 2
const toolbarUndensePaddingMultiplier = 3

const enhanceResponsiveHeader = (
  theme: Theme,
  breakpointMediaQuery: string,
): {
  toolbarCompensation: CSSProperties;
  MuiAppBar: Overrides["MuiAppBar"];
  MuiToolbar: Overrides["MuiToolbar"];
} => {
  const toolbarDenseHeight = (theme.mixins.toolbar[
    toolbarLandscapeMediaQuery
  ] as {minHeight: number}).minHeight
  const toolbarUndenseMediaQuery = theme.breakpoints.up(
    toolbarUndenseBreakpoint,
  )
  const toolbarUndenseHeight = (theme.mixins.toolbar[
    toolbarUndenseMediaQuery
  ] as {minHeight: number}).minHeight
  const toolbarDefaultPadding = theme.spacing(toolbarDefaultPaddingMultiplier)
  const toolbarUndensePadding = theme.spacing(toolbarUndensePaddingMultiplier)
  return {
    toolbarCompensation: {
      marginTop: theme.mixins.toolbar.minHeight,
      padding: toolbarDefaultPadding,
      [toolbarLandscapeMediaQuery]: {
        marginTop: toolbarDenseHeight,
      },
      [toolbarUndenseMediaQuery]: {
        marginTop: toolbarUndenseHeight,
        padding: toolbarUndensePadding,
      },
      [breakpointMediaQuery]: {
        marginTop: "unset",
        padding: toolbarDefaultPadding,
      },
    },
    MuiAppBar: {
      positionFixed: {
        [breakpointMediaQuery]: {
          position: "static",
          transform: "translateZ(0)",
        },
      },
    },
    MuiToolbar: {
      gutters: {
        [breakpointMediaQuery]: {
          paddingLeft: toolbarDefaultPadding,
          paddingRight: toolbarDefaultPadding,
        },
      },
      regular: {
        [breakpointMediaQuery]: {
          minHeight: toolbarDenseHeight,
        },
      },
    },
  }
}

export default enhanceResponsiveHeader
