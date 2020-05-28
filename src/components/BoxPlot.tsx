import {useEffect} from "react"

import * as d3 from "d3"
import moment from "moment"

import {Datum} from "../types/cryptocompare"
import {GraphProps} from "../types/util"

const margins = {left: 32, bottom: 32}

const BoxPlot = ({data, container}: GraphProps): JSX.Element => {
  // const svg = useRef<SVGSVGElement><()
  useEffect(() => {
    // TODO: draw box plot with D3 here

    const boxChart = d3
      .create("div")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")

    const min = d3.min(data, (datum) => datum.time)
    const max = d3.max(data, (datum) => datum.time)

    // const lq = data[Math.floor(data.length * 0.25)]
    // const uq = data[Math.floor(data.length * 0.75)]

    const dataRefactored = data.map((entry: Datum) => {
      const points = [entry.low, entry.high, entry.open, entry.close]
      points.sort()
      const median = (points[1] + points[2]) / 2
      points.push(median)
      return points
    })

    // let median
    /* if (data.length % 2 === 0) {
      median =
        data[Math.floor(data.length * 0.5)] +
        data[Math.floor(data.length * 0.5) + 1] / 2
    } else {
      median =
        (data[Math.floor(data.length * 0.5)] +
          data[Math.floor(data.length * 0.5) + 1]) /
        2
    } */

    // console.log("This is lq:", lq)
    // console.log("This is uq:", uq)
    // console.log("This is median:", median)

    /*
    console.table(
      data.map((datum) => ({
        ...datum,
        time: moment.unix(datum.time).toISOString(),
      })),
    ) */

    const xScale = d3
      .scaleLinear()
      .domain([min - 5, max + 5])
      .range([0, boxChart.width])
    const xAxis = d3.axisBottom(xScale)

    const chartGroup = boxChart.append("g").attr("transform", "translate( 0,0)")

    let xPosition = 15

    for (const [lq, boxStart, boxEnd, uq, median] of dataRefactored) {
      // Vertikala linjen
      // verticle line
      chartGroup
        .append("line")
        .attr("width", 5)
        .attr("stroke", "black")
        .attr("x1", xPosition)
        .attr("x2", xPosition)
        .attr("y1", lq)
        .attr("y2", uq)

      // Boxen
      // the box
      chartGroup
        .append("rect")
        .attr("width", 10)
        .attr("height", boxEnd - boxStart)
        .attr("fill", "grey")
        .attr("stroke", "black")
        .attr("x", xPosition - 5)
        .attr("y", boxStart)

      // Rita en vertikal linje vid minsta
      // Draws a verticle line at the lowest
      chartGroup
        .append("line")
        .attr("stroke", "black")
        .attr("x1", lq)
        .attr("x2", lq)
        .attr("y1", xPosition - 5)
        .attr("y2", xPosition + 5)

      // Rita en vertikal linje vid högsta
      // Draws a verticle line at the highest
      chartGroup
        .append("line")
        .attr("stroke", "black")
        .attr("x1", uq)
        .attr("x2", uq)
        .attr("y1", xPosition - 5)
        .attr("y2", xPosition + 5)

      // Rita en vertikal linje vid medianen
      // draws a verticle line in the median
      chartGroup
        .append("line")
        .attr("stroke", "black")
        .attr("x1", median)
        .attr("x2", median)
        .attr("y1", xPosition - 5)
        .attr("y2", xPosition + 5)

      xPosition += 15
    }
    // debugger
    // chartGroup.append("g").call(xAxis)
    container.appendChild(chartGroup.node())
  }, [data])

  return null
}

export default BoxPlot
