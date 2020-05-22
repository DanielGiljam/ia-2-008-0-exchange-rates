import {
  Children,
  ComponentType,
  HTMLAttributes,
  ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
} from "react"

import ListSubheader from "@material-ui/core/ListSubheader"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import Autocomplete, {
  AutocompleteProps,
  createFilterOptions,
} from "@material-ui/lab/Autocomplete"
import {UseAutocompleteProps} from "@material-ui/lab/useAutocomplete"

import {Theme, makeStyles} from "@material-ui/core/styles"

import {ListChildComponentProps, VariableSizeList} from "react-window"

import {
  autocompleteWithVirtualizationItemSize,
  autocompleteWithVirtualizationItemSizeSm,
  autocompleteWithVirtualizationListboxPadding,
} from "../theme/constants"

const useStyles = makeStyles({
  listbox: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
})

const OuterElementContext = createContext({})

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})

const renderRow = (props: ListChildComponentProps): JSX.Element => {
  const {data, index, style} = props
  const element = data[index]
  return cloneElement(element, {
    style: {
      ...style,
      top: (style.top as number) + autocompleteWithVirtualizationListboxPadding,
    },
  })
}

const ListboxComponent = forwardRef<HTMLDivElement>(
  ({children, ...props}, ref) => {
    const itemData = Children.toArray(children)
    const itemCount = itemData.length

    const gridRef = useRef<VariableSizeList>(null)

    const itemSize = useMediaQuery<Theme>(
      (theme) => theme.breakpoints.up("sm"),
      {
        noSsr: true,
      },
    )
      ? autocompleteWithVirtualizationItemSizeSm
      : autocompleteWithVirtualizationItemSize

    const getItemSize = (child: ReactNode): number =>
      isValidElement(child) && child.type === ListSubheader ? 48 : itemSize
    const getHeight = (): number =>
      itemCount > 8
        ? 8 * itemSize
        : itemData.map(getItemSize).reduce((a, b) => a + b, 0)

    useEffect(() => {
      if (gridRef.current != null) {
        gridRef.current.resetAfterIndex(0, true)
      }
    }, [itemCount])

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={props}>
          <VariableSizeList
            ref={gridRef}
            height={
              getHeight() + 2 * autocompleteWithVirtualizationListboxPadding
            }
            innerElementType={"ul"}
            itemCount={itemCount}
            itemData={itemData}
            itemSize={(index): number => getItemSize(itemData[index])}
            outerElementType={OuterElementType}
            overscanCount={5}
            width={"100%"}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    )
  },
)

interface AutocompleteWithVirtualizationProps<T> {
  className?: string;
  filterOptions?: ReturnType<typeof createFilterOptions>;
  label: string;
  multiple: boolean | undefined;
  renderOption?: AutocompleteProps<T>["renderOption"];
  renderTags?: AutocompleteProps<T>["renderTags"];
  options: T[];
}

const AutocompleteWithVirtualization = <T extends unknown>(
  props: AutocompleteProps<T> & UseAutocompleteProps<T>,
): JSX.Element => {
  const classes = useStyles()
  return (
    <Autocomplete
      {...props}
      classes={classes}
      ListboxComponent={
        ListboxComponent as ComponentType<HTMLAttributes<HTMLElement>>
      }
    />
  )
}

export default AutocompleteWithVirtualization
