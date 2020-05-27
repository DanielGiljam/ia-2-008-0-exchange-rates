import {UrlObject, format as urlFormat} from "url"

import {ReactNode, useEffect, useRef, useState} from "react"

import Router from "next/router"

import Avatar from "@material-ui/core/Avatar"
import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import Checkbox from "@material-ui/core/Checkbox"
import FormControl from "@material-ui/core/FormControl"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormLabel from "@material-ui/core/FormLabel"
import InputAdornment from "@material-ui/core/InputAdornment"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import ListItemText from "@material-ui/core/ListItemText"
import Radio from "@material-ui/core/Radio"
import RadioGroup from "@material-ui/core/RadioGroup"
import TextField from "@material-ui/core/TextField"
import OpenInNewIcon from "@material-ui/icons/OpenInNewRounded"
import RefreshIcon from "@material-ui/icons/RefreshRounded"
import {
  AutocompleteCloseReason,
  createFilterOptions,
} from "@material-ui/lab/Autocomplete"
import {
  DateRange,
  DateRangeDelimiter,
  DateRangePicker,
} from "@material-ui/pickers"

import {Theme, createStyles, makeStyles} from "@material-ui/core/styles"

import {DateRangeValidationError} from "@material-ui/pickers/src/_helpers/date-utils"
import moment from "moment"

import {Config, GraphType} from "../../pages"
import {
  autocompleteWithVirtualizationTextFieldMaxWidth,
  autocompleteWithVirtualizationTextFieldMinWidth,
  dateRangePickerTextFieldWidth,
} from "../theme/constants"
import {Coin} from "../types/cryptocompare"

import AutocompleteWithVirtualization from "./AutocompleteWithVirtualization"

const useStyles = makeStyles<Theme, ConfigurationInterfaceProps>(
  (theme: Theme) =>
    createStyles({
      form: {
        alignItems: ({config}): "center" | "flex-start" =>
          !config ? "center" : "flex-start",
        display: ({loading}): "flex" | "none" => (!loading ? "flex" : "none"),
        flexDirection: ({config}): "column" | "row" =>
          !config ? "column" : "row",
        justifyContent: "center",
        "& > :not(:last-child)": {
          marginBottom: ({config}): number => (!config ? theme.spacing(3) : 0),
          marginRight: ({config}): number => (config ? theme.spacing(3) : 0),
        },
        "& > .MuiPickersDateRangePickerInput-rangeInputsContainer": {
          // 599.95 is intentionally hardcoded
          [theme.breakpoints.down(599.95)]: {
            flexDirection: "unset",
          },
        },
      },
    }),
)

const yesterday = moment().subtract(1, "day")

const getInitialDateRange = (config?: Config): DateRange => [
  config?.from || yesterday.clone().subtract(1, "month"),
  config?.to || yesterday,
]

const getDateRangeValidationErrorMessage = (
  dateRangeValidationErrorValue: DateRangeValidationError[number],
): string | undefined => {
  if (dateRangeValidationErrorValue) {
    switch (dateRangeValidationErrorValue) {
      case "invalidRange":
        return "Invalid range."
      case "maxDate":
        return "Maximum date is yesterday."
      default:
        return "Invalid date."
    }
  }
}

const coinImageAssetPrefix = "https://cryptocompare.com"

const filterOptions = createFilterOptions({
  stringify: ({Name, CoinName}) => `${Name} ${CoinName}`,
})

const blurAutocompleteInput = (
  autocompleteInput: HTMLInputElement,
  reason: AutocompleteCloseReason,
): void => {
  if (reason === "toggleInput") {
    setTimeout(() => autocompleteInput.blur())
  }
}

interface ConfigurationInterfaceProps {
  loading: boolean;
  coinlist: Coin[];
  config: Config;
}

const ConfigurationInterface = (
  props: ConfigurationInterfaceProps,
): JSX.Element => {
  const {coinlist, config} = props
  const styles = useStyles(props)
  const [dateRange, setDateRange] = useState<DateRange>(
    getInitialDateRange(config),
  )
  const [dateRangeValidationError, setDateRangeValidationError] = useState<
    DateRangeValidationError
  >([null, null])
  const [dateRangeError, setDateRangeError] = useState([false, false])
  const [coin, setCoin] = useState<Coin | null>(config?.coin || null)
  const [coinsError, setCoinsError] = useState(false)
  const [graphType, setGraphType] = useState<GraphType>(
    config?.graphType || "boxplot",
  )
  const [liveRefresh, setLiveRefresh] = useState(false)
  const autocompleteInput = useRef<HTMLInputElement>(null)
  const submitForm = (blank?: boolean): void => {
    if (!dateRange[0] && !dateRangeValidationError[0]) {
      setDateRangeError((prevState) => [true, prevState[1]])
    }
    if (!dateRange[1] && !dateRangeValidationError[1]) {
      setDateRangeError((prevState) => [prevState[0], true])
    }
    if (!coin) setCoinsError(true)
    if (
      dateRange.every((date) => date) &&
      dateRangeValidationError.every((error) => !error) &&
      coin
    ) {
      const urlObject: UrlObject = {
        pathname: "/",
        query: {
          graphtype: graphType,
          from: dateRange[0].format(moment.HTML5_FMT.DATE),
          to: dateRange[1].format(moment.HTML5_FMT.DATE),
          coin: coin.Id,
        },
      }
      if (blank) {
        window.open(urlFormat(urlObject), "_blank")
      } else {
        Router.push(urlObject, undefined, {shallow: liveRefresh})
      }
    }
  }
  useEffect(() => {
    if (!liveRefresh) {
      setDateRange(getInitialDateRange(config))
      setCoin(config?.coin || null)
      setGraphType(config?.graphType || "boxplot")
    }
    if (liveRefresh && !config) setLiveRefresh(false)
  }, [config, liveRefresh])
  useEffect(() => {
    if (liveRefresh) submitForm()
  }, [dateRange, coin, graphType, liveRefresh])
  const size = config ? "small" : "medium"
  return (
    <form className={styles.form}>
      <DateRangePicker
        endText={"To"}
        inputFormat={moment.HTML5_FMT.DATE}
        mask={"____-__-__"}
        maxDate={yesterday}
        renderInput={(
          {
            error: startError,
            helperText: startHelperText,
            value: startValue,
            ...startProps
          },
          {
            error: endError,
            helperText: endHelperText,
            value: endValue,
            ...endProps
          },
        ): JSX.Element => (
          <>
            <TextField
              error={(dateRangeError[0] && !startValue) || startError}
              helperText={
                dateRangeError[0] && !startValue
                  ? "Required."
                  : getDateRangeValidationErrorMessage(
                    dateRangeValidationError[0],
                  ) || startHelperText
              }
              id={"from"}
              name={"from"}
              size={size}
              style={{maxWidth: dateRangePickerTextFieldWidth}}
              value={startValue}
              {...startProps}
            />
            <DateRangeDelimiter> to </DateRangeDelimiter>
            <TextField
              error={(dateRangeError[1] && !endValue) || endError}
              helperText={
                dateRangeError[1] && !endValue
                  ? "Required."
                  : getDateRangeValidationErrorMessage(
                    dateRangeValidationError[1],
                  ) || endHelperText
              }
              id={"to"}
              name={"to"}
              size={size}
              style={{maxWidth: dateRangePickerTextFieldWidth}}
              value={endValue}
              {...endProps}
            />
          </>
        )}
        startText={"From"}
        value={dateRange}
        disableHighlightToday
        onChange={setDateRange}
        onError={setDateRangeValidationError}
      />
      <AutocompleteWithVirtualization
        filterOptions={filterOptions}
        fullWidth={!config}
        getOptionLabel={({CoinName}): string => CoinName}
        id={"coins"}
        options={coinlist}
        renderInput={(params): JSX.Element => (
          <TextField
            error={coinsError && !coin}
            helperText={
              coinsError && !coin
                ? "You must select at least one coin."
                : undefined
            }
            inputRef={autocompleteInput}
            label={"Coins"}
            name={"coins"}
            variant={"outlined"}
            {...params}
            InputProps={{
              ...params.InputProps,
              startAdornment: coin ? (
                <InputAdornment position={"start"}>
                  <Avatar
                    alt={coin.Name}
                    src={coinImageAssetPrefix + coin.ImageUrl + "?width=40"}
                    variant={"square"}
                  />
                </InputAdornment>
              ) : undefined,
            }}
          />
        )}
        renderOption={({ImageUrl, CoinName, Name}): ReactNode => (
          <>
            <ListItemAvatar>
              <Avatar
                alt={Name}
                src={coinImageAssetPrefix + ImageUrl + "?width=40"}
                variant={"square"}
              />
            </ListItemAvatar>
            <ListItemText
              primary={CoinName}
              primaryTypographyProps={{noWrap: true}}
              secondary={Name}
              secondaryTypographyProps={{noWrap: true}}
            />
          </>
        )}
        style={{
          maxWidth: autocompleteWithVirtualizationTextFieldMaxWidth,
          minWidth: autocompleteWithVirtualizationTextFieldMinWidth,
        }}
        value={coin}
        autoHighlight
        disableCloseOnSelect
        filterSelectedOptions
        onChange={(_event, value): void => setCoin(value)}
        onClose={(_event, reason): void =>
          blurAutocompleteInput(autocompleteInput.current, reason)
        }
      />
      <FormControl component={"fieldset"}>
        <FormLabel component={"legend"}>Graph Type</FormLabel>
        <RadioGroup
          aria-label={"Graph Type"}
          name={"graphtype"}
          row={!config}
          value={graphType}
          onChange={(event): void =>
            setGraphType(event.target.value as GraphType)
          }
        >
          <FormControlLabel
            control={<Radio size={size} />}
            label={"Box Plot"}
            value={"boxplot"}
          />
          <FormControlLabel
            control={<Radio size={size} />}
            label={"Line Chart"}
            value={"linechart"}
          />
        </RadioGroup>
      </FormControl>
      <FormControl component={"fieldset"}>
        <ButtonGroup
          aria-label={config ? "Deploy Changes" : "Render Graph"}
          color={"primary"}
          fullWidth={!!config}
          variant={"contained"}
          disableElevation
        >
          <Button
            aria-label={config ? "Refresh" : "Render Graph"}
            title={config ? "Refresh" : "Render Graph"}
            onClick={(): void => submitForm()}
          >
            {config ? <RefreshIcon /> : "Render Graph"}
          </Button>
          <Button
            aria-label={"Open In New Tab"}
            title={"Open In New tab"}
            onClick={(): void => submitForm(true)}
          >
            {config ? <OpenInNewIcon /> : "In New tab"}
          </Button>
        </ButtonGroup>
        {config ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={liveRefresh}
                onChange={(event): void => setLiveRefresh(event.target.checked)}
              />
            }
            label={"Live Refresh"}
          />
        ) : undefined}
      </FormControl>
    </form>
  )
}

export default ConfigurationInterface
