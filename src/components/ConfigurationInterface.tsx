import {ReactNode, useEffect, useRef, useState} from "react"

import Router from "next/router"

import Button from "@material-ui/core/Button"
import Chip from "@material-ui/core/Chip"
import FormControl from "@material-ui/core/FormControl"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormLabel from "@material-ui/core/FormLabel"
import Radio from "@material-ui/core/Radio"
import RadioGroup from "@material-ui/core/RadioGroup"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
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
import {Coin} from "../types/cryptocompare"

import AutocompleteWithVirtualization from "./AutocompleteWithVirtualization"

const useStyles = makeStyles<Theme, boolean>((theme: Theme) =>
  createStyles({
    form: {
      alignItems: "center",
      display: "flex",
      flexDirection: (dense): "column" | "row" => (!dense ? "column" : "row"),
      justifyContent: "center",
      "& > :not(:last-child)": {
        marginBottom: (dense): number => (!dense ? theme.spacing(3) : 0),
        marginRight: (dense): number => (dense ? theme.spacing(3) : 0),
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

const filterOptions = createFilterOptions({
  stringify: ({Name, CoinName}) => `${Name} ${CoinName}`,
})

const setAutocompleteWidth = (
  wrapper: HTMLFormElement,
  autocomplete: HTMLDivElement,
): void => {
  if (autocomplete) {
    autocomplete.style.width = wrapper.getBoundingClientRect().width + "px"
  }
}

const blurAutocompleteInput = (
  autocompleteInput: HTMLInputElement,
  reason: AutocompleteCloseReason,
): void => {
  if (reason === "toggleInput") {
    setTimeout(() => autocompleteInput.blur())
  }
}

interface ConfigurationInterfaceProps {
  coinlist: Coin[];
  coinlistLoadingError: boolean;
  config: Config;
  dense: boolean;
}

const ConfigurationInterface = ({
  coinlist,
  coinlistLoadingError,
  config,
  dense,
}: ConfigurationInterfaceProps): JSX.Element => {
  const styles = useStyles(dense)
  const [dateRange, setDateRange] = useState<DateRange>([
    config?.from || yesterday.clone().subtract(1, "month"),
    config?.to || yesterday,
  ])
  const [dateRangeValidationError, setDateRangeValidationError] = useState<
    DateRangeValidationError
  >([null, null])
  const [dateRangeError, setDateRangeError] = useState([false, false])
  const [coins, setCoins] = useState(config?.coins || [])
  const [coinsError, setCoinsError] = useState(false)
  const [graphType, setGraphType] = useState<GraphType>(
    config?.graphType || "boxplot",
  )
  const form = useRef<HTMLFormElement>(null)
  const autocomplete = useRef<HTMLDivElement>(null)
  const autocompleteInput = useRef<HTMLInputElement>(null)
  const submitForm = (): void => {
    if (!dateRange[0] && !dateRangeValidationError[0]) {
      setDateRangeError((prevState) => [true, prevState[1]])
    }
    if (!dateRange[1] && !dateRangeValidationError[1]) {
      setDateRangeError((prevState) => [prevState[0], true])
    }
    if (!coins.length) setCoinsError(true)
    if (
      dateRange.every((date) => date) &&
      dateRangeValidationError.every((error) => !error) &&
      coins.length
    ) {
      Router.push(
        {
          pathname: "/",
          query: {
            graphtype: graphType,
            from: dateRange[0].format(moment.HTML5_FMT.DATE),
            to: dateRange[1].format(moment.HTML5_FMT.DATE),
            coin: coins.map(({Id}) => Id),
          },
        },
        undefined,
        {shallow: true},
      )
    }
  }
  useEffect(() => {
    if (!dense) {
      setAutocompleteWidth(form.current, autocomplete.current)
      window.addEventListener("resize", () =>
        setAutocompleteWidth(form.current, autocomplete.current),
      )
    }
    return (): void => {
      window.removeEventListener("resize", () =>
        setAutocompleteWidth(form.current, autocomplete.current),
      )
    }
  }, [dense])
  useEffect(() => {
    if (config) {
      setDateRange([config.from, config.to])
      setCoins(config.coins)
      setGraphType(config.graphType)
    }
  }, [config])
  const size = dense ? "small" : "medium"
  return (
    <form ref={form} className={styles.form}>
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
        ref={autocomplete}
        filterOptions={filterOptions}
        fullWidth={!dense}
        getOptionLabel={({CoinName}): string => CoinName}
        id={"coins"}
        loading={!coinlist.length}
        loadingText={
          coinlistLoadingError
            ? "Encountered an error while trying to load the coinlist. See the console for more information."
            : undefined
        }
        options={coinlist}
        renderInput={(params): JSX.Element => (
          <TextField
            error={coinsError && !coins.length}
            helperText={
              coinsError && !coins.length
                ? "You must select at least one coin."
                : undefined
            }
            inputRef={autocompleteInput}
            label={"Coins"}
            name={"coins"}
            size={size}
            variant={"outlined"}
            {...params}
          />
        )}
        renderOption={({CoinName}): ReactNode => (
          <Typography noWrap>{CoinName}</Typography>
        )}
        renderTags={(tagValue, getTagProps): ReactNode =>
          tagValue.map(({Name}, index) => (
            <Chip
              key={Name}
              label={Name}
              size={size}
              {...getTagProps({index})}
            />
          ))
        }
        value={coins}
        autoHighlight
        disableCloseOnSelect
        filterSelectedOptions
        multiple
        onChange={(_event, value): void => setCoins(value)}
        onClose={(_event, reason): void =>
          blurAutocompleteInput(autocompleteInput.current, reason)
        }
      />
      <FormControl component={"fieldset"}>
        {!dense ? (
          <FormLabel component={"legend"}>Graph Type</FormLabel>
        ) : undefined}
        <RadioGroup
          aria-label={"Graph Type"}
          name={"graphtype"}
          value={graphType}
          row
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
      <Button
        color={"primary"}
        size={size}
        variant={"contained"}
        onClick={submitForm}
      >
        Go!
      </Button>
    </form>
  )
}

export default ConfigurationInterface
