import {ParsedUrlQuery} from "querystring"

import {useEffect, useState} from "react"

import {useRouter} from "next/router"

import CircularProgress from "@material-ui/core/CircularProgress"
import Divider from "@material-ui/core/Divider"

import {Theme, createStyles, makeStyles} from "@material-ui/core/styles"

import unfetch from "isomorphic-unfetch"

import moment, {Moment} from "moment"

import ConfigurationInterface from "../src/components/ConfigurationInterface"
import {Coin} from "../src/types/cryptocompare"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      width: "100%",
    },
    graph: {
      width: "100%",
      flexGrow: 1,
    },
  }),
)

const coinlistURL = "https://min-api.cryptocompare.com/data/all/coinlist"

const fetchCoinlist = (): Promise<Coin[]> => {
  return unfetch(coinlistURL)
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
}

const yesterday = moment().subtract(1, "day")

const validateAndApplyQuery = async (
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
  console.group("validating query")
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
  const [coinlist, setCoinlist] = useState<Coin[]>([])
  const [config, setConfig] = useState<Config | undefined>()
  useEffect(() => {
    fetchCoinlist()
      .then(setCoinlist)
      .catch((error) => {
        // TODO: display error message if coinlist fetch fails
        console.error(error)
      })
  }, [])
  useEffect(() => {
    if (coinlist.length) {
      validateAndApplyQuery(router.query, coinlist).then((config) => {
        if (config) setConfig(config)
        if (loading) setLoading(false)
      })
    }
  }, [coinlist, router.query])
  return (
    <>
      <ConfigurationInterface
        coinlist={coinlist}
        config={config}
        loading={loading}
      />
      {loading ? (
        <CircularProgress disableShrink />
      ) : config ? (
        <>
          <Divider className={styles.divider} />
          <div className={styles.graph} />
        </>
      ) : undefined}
    </>
  )
}

export default Index
