import {useEffect, useState} from "react"

import * as d3 from "d3"

import {GraphFunction, GraphProps} from "../types/util.d"

const margins = {left: 36, bottom: 28}

const BoxPlot = (props: GraphProps): JSX.Element => {
  const [boxPlotFunction, setBoxPlotFunction] = useState<GraphFunction>()
  useEffect(() => {
    if (!boxPlotFunction) {
      const boxPlotFunction = ({data, container}: GraphProps): string => {
        const containerRect = container.getBoundingClientRect()

        const height = containerRect.height - margins.bottom
        const width = containerRect.width - margins.left

        const boxPlot = d3.create("svg")

        const min = d3.min(data, (datum) => datum.low)
        const max = d3.max(data, (datum) => datum.high)

        const dataRefactored = data.map((entry) => {
          const points = [entry.low, entry.high, entry.open, entry.close]
          points.sort()
          const median = (points[1] + points[2]) / 2
          points.push(median)
          return points
        })

        const yScale = d3
          .scaleLinear()
          .domain([min - 5, max + 5])
          .range([0, width])
        const yAxis = d3.axisLeft(yScale)

        const chartGroup = boxPlot
          .append("g")
          .attr("transform", "translate(0,0)")

        let xPosition = 15

        for (const [lq, boxStart, boxEnd, uq, median] of dataRefactored) {
          chartGroup
            .append("line")
            .attr("width", 5)
            .attr("stroke", "black")
            .attr("x1", xPosition)
            .attr("x2", xPosition)
            .attr("y1", yScale(lq))
            .attr("y2", yScale(uq))

          // Boxen
          // the box
          chartGroup
            .append("rect")
            .attr("width", 10)
            .attr("height", boxEnd - boxStart)
            .attr("fill", "grey")
            .attr("stroke", "black")
            .attr("x", xPosition - 5)
            .attr("y", yScale(boxStart))

          // Rita en vertikal linje vid minsta
          // Draws a verticle line at the lowest
          chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("y1", yScale(lq))
            .attr("y2", yScale(lq))
            .attr("x1", xPosition - 5)
            .attr("x2", xPosition + 5)

          // Rita en vertikal linje vid högsta
          // Draws a verticle line at the highest
          chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("y1", yScale(uq))
            .attr("y2", yScale(uq))
            .attr("x1", xPosition - 5)
            .attr("x2", xPosition + 5)

          // Rita en vertikal linje vid medianen
          // draws a verticle line in the median
          chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("y1", yScale(median))
            .attr("y2", yScale(median))
            .attr("x1", xPosition - 5)
            .attr("x2", xPosition + 5)
          console.log("This is lq:", lq)
          console.log("This is uq:", uq)
          console.log("This is median:", median)
          xPosition += 15
        }

        return boxPlot.html()
      }
      setBoxPlotFunction(() => boxPlotFunction)
    }
  }, [props])
  return (
    <svg
      dangerouslySetInnerHTML={{
        __html: boxPlotFunction ? boxPlotFunction(props) : "",
      }}
      height={"100%"}
      width={"100%"}
    />
  )
}

export default BoxPlot
