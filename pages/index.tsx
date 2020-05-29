import {ParsedUrlQuery} from "querystring"

import {useEffect, useRef, useState} from "react"

import {useRouter} from "next/router"

import {Typography} from "@material-ui/core"
import CircularProgress from "@material-ui/core/CircularProgress"
import Divider from "@material-ui/core/Divider"

import {Theme, createStyles, makeStyles} from "@material-ui/core/styles"

import unfetch from "isomorphic-unfetch"

import moment, {Moment} from "moment"

import BoxPlot from "../src/components/BoxPlot"
import ConfigurationInterface from "../src/components/ConfigurationInterface"
import LineChart from "../src/components/LineChart"
import {Coin, Datum} from "../src/types/cryptocompare"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      width: "100%",
    },
    graph: {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      justifyContent: "center",
      width: "100%",
    },
  }),
)

const errorMessage = "Encountered an error. See console for more information."

const dailySymbolVolumeURL =
  "https://min-api.cryptocompare.com/data/v2/histohour"
const coinlistURL = "https://min-api.cryptocompare.com/data/all/coinlist"

const tsym = "EUR"

// According to https://min-api.cryptocompare.com/documentation?key=Historical&cat=dataSymbolHistoday 2020-05-26
const maxLimit = 2000

const fetchCoinlist = (): Promise<Coin[]> =>
  unfetch(coinlistURL)
    .then((req) => req.json())
    .then((data) =>
      Object.values(data.Data)
        .map(({CoinName, ...coin}: Coin) => ({
          CoinName: CoinName.trim(),
          ...coin,
        }))
        .sort((a, b) =>
          a.CoinName.replace(/^\W+/, "").localeCompare(
            b.CoinName.replace(/^\W+/, ""),
          ),
        ),
    )

const fetchHourlyPairOHLCV = async ({
  from,
  to,
  coin,
}: Config): Promise<Datum[]> => {
  let limit = to.diff(from, "hours")
  const toTs = to.clone().add(1, "day")
  const chunkParams: {limit: number; toTs: number}[] = []
  while (limit > maxLimit) {
    chunkParams.push({
      limit: maxLimit,
      toTs: toTs.unix(),
    })
    toTs.subtract(maxLimit, "days")
    limit -= maxLimit
  }
  if (limit > 0) {
    chunkParams.push({limit, toTs: toTs.unix()})
  }
  return Promise.all(
    chunkParams.map(({limit, toTs}) =>
      unfetch(
        `${dailySymbolVolumeURL}?fsym=${coin.Name}&tsym=${tsym}&limit=${limit}&toTs=${toTs}`,
      ).then((req) => req.json()),
    ),
  ).then((chunks) =>
    chunks
      .map((chunk) => chunk.Data.Data)
      .reverse()
      .flat(),
  )
}

const yesterday = moment().subtract(1, "day")

const parseQuery = async (
  query: ParsedUrlQuery,
  coinlist: Coin[],
): Promise<Config | undefined> => {
  const from = moment(query.from, moment.HTML5_FMT.DATE)
  const to = moment(query.to, moment.HTML5_FMT.DATE)
  const coin = !Array.isArray(query.coin)
    ? coinlist.find(({Id}) => Id === query.coin)
    : undefined
  const graphType =
    !Array.isArray(query.graphtype) && /boxplot|linechart/.test(query.graphtype)
      ? (query.graphtype as GraphType)
      : undefined
  console.groupCollapsed("parseQuery")
  console.log("from.isValid():", from.isValid())
  console.log("to.isValid():", to.isValid())
  console.log("from.isBefore(to):", from.isBefore(to))
  console.log("from.isBefore(yesterday):", from.isBefore(yesterday))
  console.log("to.isBefore(yesterday):", to.isBefore(yesterday))
  console.log("coin:", !!coin)
  console.log("graphType:", !!graphType)
  console.groupEnd()
  if (
    from.isValid() &&
    to.isValid() &&
    from.isBefore(to) &&
    from.isBefore(yesterday) &&
    to.isBefore(yesterday) &&
    coin &&
    graphType
  ) {
    return {from, to, coin, graphType}
  }
}

export type GraphType = "boxplot" | "linechart"

export interface Config {
  from: Moment;
  to: Moment;
  coin: Coin;
  graphType: GraphType;
}

const Index = (): JSX.Element => {
  const styles = useStyles()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [coinlist, setCoinlist] = useState<Coin[]>([])
  const [config, setConfig] = useState<Config | undefined>()
  const [data, setData] = useState<Datum[]>([])
  const graphContainer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    fetchCoinlist()
      .then(setCoinlist)
      .catch((error) => {
        console.error(error)
        setError(true)
      })
  }, [])
  useEffect(() => {
    if (coinlist.length) {
      parseQuery(router.query, coinlist).then((parsedConfig) => {
        if (parsedConfig) setConfig(parsedConfig)
        else if (config) setConfig(undefined)
        if (loading) setLoading(false)
      })
    }
  }, [coinlist, router.query])
  useEffect(() => {
    if (config) {
      fetchHourlyPairOHLCV(config)
        .then(setData)
        .catch((error) => {
          console.error(error)
          setError(true)
        })
    }
  }, [config])
  return error ? (
    <Typography>{errorMessage}</Typography>
  ) : (
    <>
      <ConfigurationInterface
        coinlist={coinlist}
        config={config}
        loading={loading}
      />
      {config ? (
        <>
          <Divider className={styles.divider} />
          <div ref={graphContainer} className={styles.graph}>
            {data.length ? (
              config.graphType === "boxplot" ? (
                <BoxPlot container={graphContainer.current} data={data} />
              ) : (
                <LineChart container={graphContainer.current} data={data} />
              )
            ) : (
              <CircularProgress disableShrink />
            )}
          </div>
        </>
      ) : undefined}
    </>
  )
}

export default Index
