import {useEffect} from "react"

import * as d3 from "d3"

import {GraphProps} from "../types/util"

const margins = {left: 32, bottom: 32}

const LineChart = ({data, container}: GraphProps): JSX.Element => {
  useEffect(() => {
    // TODO: optimize this
    const containerRect = container.getBoundingClientRect()
    const height = containerRect.height - margins.bottom
    const width = containerRect.width - margins.left
    const lineChart = d3
      .create("svg")
      .attr("width", "100%")
      .attr("height", "100%")
    const x = d3
      .scaleLinear()
      .domain([
        d3.min(data, (datum) => datum.time),
        d3.max(data, (datum) => datum.time),
      ])
      .range([0, width])
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (datum) => datum.total_volume_total),
        d3.max(data, (datum) => datum.total_volume_total),
      ])
      .range([height, 0])
    const line = d3
      .line()
      .x((datum) => x(datum.time))
      .y((datum) => y(datum.total_volume_total))
    lineChart
      .append("g")
      .attr("transform", `translate(${margins.left},0)`)
      .append("path")
      .attr("d", line(data))
      .attr("fill", "none")
      .attr("stroke", "black")
    container.innerHTML = ""
    container.appendChild(lineChart.node())
  }, [data])
  return null
}

export default LineChart
