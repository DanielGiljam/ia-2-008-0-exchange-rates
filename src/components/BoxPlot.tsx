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

        const min = d3.min(data, (datum) => datum.time)
        const max = d3.max(data, (datum) => datum.time)

        const dataRefactored = data.map((entry) => {
          const points = [entry.low, entry.high, entry.open, entry.close]
          points.sort()
          const median = (points[1] + points[2]) / 2
          points.push(median)
          return points
        })

        const xScale = d3
          .scaleLinear()
          .domain([min - 5, max + 5])
          .range([0, width])
        const xAxis = d3.axisBottom(xScale)

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
            .attr("y1", lq)
            .attr("y2", uq)

          chartGroup
            .append("rect")
            .attr("width", 10)
            .attr("height", boxEnd - boxStart)
            .attr("fill", "grey")
            .attr("stroke", "black")
            .attr("x", xPosition - 5)
            .attr("y", boxStart)

          chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("x1", lq)
            .attr("x2", lq)
            .attr("y1", xPosition - 5)
            .attr("y2", xPosition + 5)

          chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("x1", uq)
            .attr("x2", uq)
            .attr("y1", xPosition - 5)
            .attr("y2", xPosition + 5)

          chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("x1", median)
            .attr("x2", median)
            .attr("y1", xPosition - 5)
            .attr("y2", xPosition + 5)

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
