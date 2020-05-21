import {ReactNode, useEffect, useRef, useState} from "react"

import {GetStaticProps} from "next"

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

import AutocompleteWithVirtualization from "../src/components/AutocompleteWithVirtualization"
import {Coin} from "../src/types/cryptocompare"

const coinlistURL = "https://min-api.cryptocompare.com/data/all/coinlist"

export const getStaticProps: GetStaticProps = async () => {
  const coinlist = await fetch(coinlistURL)
    .then((req) => req.json())
    .then((data) =>
      Object.values(data.Data)
        .map(({Name, CoinName}) => ({
          Name,
          CoinName: CoinName.trim(),
        }))
        .sort((a, b) =>
          a.CoinName.replace(/^\W+/, "").localeCompare(
            b.CoinName.replace(/^\W+/, ""),
          ),
        ),
    )
    .catch((error) => {
      console.error(error)
      return []
    })
  return {props: {coinlist}}
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      "& > :not(:last-child)": {
        marginBottom: theme.spacing(3),
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

type GraphType = "boxplot" | "linechart"

interface IndexProps {
  coinlist: Coin[];
}

// TODO: fetch coinlist client-side
// TODO: finish submitForm function
const Index = ({coinlist}: IndexProps): JSX.Element => {
  const styles = useStyles()
  const [dateRange, setDateRange] = useState<DateRange>([
    yesterday.clone().subtract(1, "month"),
    yesterday,
  ])
  const [dateRangeValidationError, setDateRangeValidationError] = useState<
    DateRangeValidationError
  >([null, null])
  const [dateRangeError, setDateRangeError] = useState([false, false])
  const [coins, setCoins] = useState([])
  const [coinsError, setCoinsError] = useState(false)
  const [graphType, setGraphType] = useState<GraphType>("bollinger-bands")
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
  }
  useEffect(() => {
    setAutocompleteWidth(form.current, autocomplete.current)
    window.addEventListener("resize", () =>
      setAutocompleteWidth(form.current, autocomplete.current),
    )
    return (): void => {
      window.removeEventListener("resize", () =>
        setAutocompleteWidth(form.current, autocomplete.current),
      )
    }
  }, [])
  return (
    <form ref={form} className={styles.form}>
      <DateRangePicker
        endText={"To"}
        inputFormat={"YYYY-MM-DD"}
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
        getOptionLabel={({CoinName}): string => CoinName}
        id={"coins"}
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
            variant={"outlined"}
            {...params}
          />
        )}
        renderOption={({CoinName}): ReactNode => (
          <Typography noWrap>{CoinName}</Typography>
        )}
        renderTags={(tagValue, getTagProps): ReactNode =>
          tagValue.map(({Name}, index) => (
            <Chip key={Name} label={Name} {...getTagProps({index})} />
          ))
        }
        value={coins}
        autoHighlight
        disableCloseOnSelect
        filterSelectedOptions
        fullWidth
        multiple
        onChange={(_event, value): void => setCoins(value)}
        onClose={(_event, reason): void =>
          blurAutocompleteInput(autocompleteInput.current, reason)
        }
      />
      <FormControl component={"fieldset"}>
        <FormLabel component={"legend"}>Graph Type</FormLabel>
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
            control={<Radio />}
            label={"Box Plot"}
            value={"boxplot"}
          />
          <FormControlLabel
            control={<Radio />}
            label={"Line Chart"}
            value={"linechart"}
          />
        </RadioGroup>
      </FormControl>
      <Button color={"primary"} variant={"contained"} onClick={submitForm}>
        Go!
      </Button>
    </form>
  )
}

export default Index
