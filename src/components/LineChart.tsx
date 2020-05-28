import {useEffect, useState} from "react"

import * as d3 from "d3"
import moment from "moment"

import {Datum} from "../types/cryptocompare"
import {GraphFunction, GraphProps} from "../types/util.d"

const margins = {left: 36, bottom: 28}

const LineChart = (props: GraphProps): JSX.Element => {
  const [lineChartFunction, setLineChartFunction] = useState<GraphFunction>()
  useEffect(() => {
    if (!lineChartFunction) {
      const lineChartFunction = ({data, container}: GraphProps): string => {
        const containerRect = container.getBoundingClientRect()

        const height = containerRect.height - margins.bottom
        const width = containerRect.width - margins.left

        const lineChart = d3.create("svg")

        const xScale = d3
          .scaleTime()
          .domain([
            d3.min(data, (datum) => moment.unix(datum.time).toDate()),
            d3.max(data, (datum) => moment.unix(datum.time).toDate()),
          ])
          .range([0, width])
        const yScale = d3
          .scaleLinear()
          .domain([
            d3.min(data, (datum) => datum.close),
            d3.max(data, (datum) => datum.close),
          ])
          .range([height, 0])

        const xAxis = d3.axisBottom(xScale)
        const yAxis = d3.axisLeft(yScale)

        const line = d3
          .line<Datum>()
          .x((datum) => xScale(moment.unix(datum.time).toDate()))
          .y((datum) => yScale(datum.close))

        lineChart
          .append("g")
          .attr("transform", `translate(${margins.left},${height})`)
          .call(xAxis, data)
        lineChart
          .append("g")
          .attr("transform", `translate(${margins.left},0)`)
          .call(yAxis, data)

        lineChart
          .append("g")
          .append("path")
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("transform", `translate(${margins.left},0)`)
          .attr("d", line(data))

        return lineChart.html()
      }
      setLineChartFunction(() => lineChartFunction)
    }
  }, [props])
  return (
    <svg
      dangerouslySetInnerHTML={{
        __html: lineChartFunction ? lineChartFunction(props) : "",
      }}
      height={"100%"}
      width={"100%"}
    />
  )
}

export default LineChart
