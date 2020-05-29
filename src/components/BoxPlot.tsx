import {useMemo} from "react"

import green from "@material-ui/core/colors/green"
import red from "@material-ui/core/colors/red"

import * as d3 from "d3"
import moment from "moment"

import {Datum} from "../types/cryptocompare"
import {GraphProps} from "../types/util.d"

const firstDataChunkSize = 3
const dataChunkSize = 24
const lastDataChunkSize = 22

const margins = {left: 50, bottom: 25}
const strokeWidth = 10

const transformData = (data: Datum[]): TransformedDatum[] => {
  const dataClone = [...data]
  const firstDataChunk = dataClone.splice(0, firstDataChunkSize)
  const lastDataChunk = dataClone.splice(-lastDataChunkSize)
  const middleDataChunks: Datum[][] = []
  while (dataClone.length) {
    middleDataChunks.push(dataClone.splice(0, dataChunkSize))
  }
  const dataChunks = [firstDataChunk, ...middleDataChunks, lastDataChunk]
  // #region TRANSFORM DATA RUNTIME ASSERTION 1
  if (dataChunks[dataChunks.length - 2].length !== dataChunkSize) {
    throw new Error("Data was spliced into chunks incorrectly!")
  }
  // #endregion
  return dataChunks.map((dataChunk) => {
    const dataChunkTimeString = moment
      .unix(dataChunk[0].time)
      .toISOString()
      .slice(0, 10)
    // #region TRANSFORM DATA RUNTIME ASSERTION 2
    if (
      !dataChunk.every((datum) => {
        const timeString = moment.unix(datum.time).toISOString().slice(0, 10)
        return timeString === dataChunkTimeString
      })
    ) {
      throw new Error("Data was spliced into chunks incorrectly!")
    }
    // #endregion
    const allHighsAndLows = dataChunk
      .map((datum) => [datum.high, datum.low])
      .flat()
      .sort()
    return {
      time: moment(dataChunkTimeString, moment.HTML5_FMT.DATE).toDate(),
      max: d3.max(allHighsAndLows),
      uq: d3.quantile(allHighsAndLows, 0.75),
      median: d3.quantile(allHighsAndLows, 0.5),
      lq: d3.quantile(allHighsAndLows, 0.25),
      min: d3.min(allHighsAndLows),
    }
  })
}

interface TransformedDatum {
  time: Date;
  max: number;
  uq: number;
  median: number;
  lq: number;
  min: number;
}

const BoxPlot = ({data, container}: GraphProps): JSX.Element => {
  const boxPlot = useMemo(() => {
    let transformedData: TransformedDatum[]

    // TODO: Implement way to better communicate error to the user
    try {
      transformedData = transformData(data)
    } catch (error) {
      console.error(error)
      transformedData = []
    }

    const containerRect = container.getBoundingClientRect()
    const height = containerRect.height - margins.bottom
    const width = containerRect.width - margins.left

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(transformedData, (datum) => datum.time),
        d3.max(transformedData, (datum) => datum.time),
      ])
      .range([0, width])
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(transformedData, (datum) => datum.min),
        d3.max(transformedData, (datum) => datum.max),
      ])
      .range([height, 0])

    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    const boxPlot = d3.create("svg")

    boxPlot
      .append("g")
      .attr("transform", `translate(${margins.left},${height})`)
      .call(xAxis, transformedData)
    boxPlot
      .append("g")
      .attr("transform", `translate(${margins.left},0)`)
      .call(yAxis, transformedData)

    const chartGroup = boxPlot
      .append("g")
      .attr("transform", `translate(${margins.left},0)`)

    const halfOfStrokeWidth = strokeWidth / 2
    let prevMedian = transformedData[0]?.median
    console.groupCollapsed("transformedDatums")
    transformedData.forEach(({time, max, uq, median, lq, min}, index) => {
      if (index === 0 || index === transformedData.length - 1) return
      console.log(`transformedDatum ${time.toISOString().slice(0, 10)}`, {
        max,
        uq,
        median,
        lq,
        min,
      })

      const x = xScale(time)
      const yMax = yScale(max)
      const yMedian = yScale(median)
      const yMin = yScale(min)
      const color = median > prevMedian ? green[700] : red[700]
      prevMedian = median

      // Horizontal line, max
      chartGroup
        .append("line")
        .attr("stroke", color)
        .attr("x1", x - halfOfStrokeWidth)
        .attr("x2", x + halfOfStrokeWidth)
        .attr("y1", yMax)
        .attr("y2", yMax)

      // Vertical line, max to median
      chartGroup
        .append("line")
        .attr("stroke", color)
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yMax)
        .attr("y2", yMedian)

      // Box, upper quantile
      chartGroup
        .append("line")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(uq))
        .attr("y2", yScale(lq))

      // Vertical line, median to min
      chartGroup
        .append("line")
        .attr("stroke", color)
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yMedian)
        .attr("y2", yMin)

      // Horizontal line, min
      chartGroup
        .append("line")
        .attr("stroke", color)
        .attr("x1", x - halfOfStrokeWidth)
        .attr("x2", x + halfOfStrokeWidth)
        .attr("y1", yMin)
        .attr("y2", yMin)
    })
    console.groupEnd()

    return boxPlot.html()
  }, [data, container])
  return (
    <svg
      dangerouslySetInnerHTML={{__html: boxPlot}}
      height={"100%"}
      width={"100%"}
    />
  )
}

export default BoxPlot
