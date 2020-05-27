import {useEffect} from "react"

import {GraphProps} from "../types/util"

const BoxPlot = ({data, container}: GraphProps): JSX.Element => {
  useEffect(() => {
    // TODO: draw box plot with D3 here
  }, [data])
  return null
}

export default BoxPlot
