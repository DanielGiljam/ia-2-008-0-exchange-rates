import {SyntheticEvent} from "react"

import IconButton from "@material-ui/core/IconButton"
import Snackbar from "@material-ui/core/Snackbar"
import CloseIcon from "@material-ui/icons/Close"

const errorMessageSnackbarAutoHideDuration = 6000

interface ErrorMessageSnackbarProps {
  message?: string;
  isShown?: boolean;
  onHide: () => void;
}

const ErrorMessageSnackbar = ({
  message,
  isShown,
  onHide,
}: ErrorMessageSnackbarProps): JSX.Element => {
  const close = (
    event: SyntheticEvent<Element, Event>,
    reason?: string,
  ): void => {
    if (reason === "clickaway") return
    onHide()
  }
  return (
    <Snackbar
      action={
        <IconButton
          aria-label={"close"}
          color={"inherit"}
          size={"small"}
          onClick={close}
        >
          <CloseIcon fontSize={"small"} />
        </IconButton>
      }
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      autoHideDuration={errorMessageSnackbarAutoHideDuration}
      message={message}
      open={isShown}
      onClose={close}
    />
  )
}

export default ErrorMessageSnackbar
