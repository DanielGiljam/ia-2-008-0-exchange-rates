import {ParsedUrlQuery} from "querystring"

import {useEffect, useState} from "react"

import {useRouter} from "next/router"

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

const arrayify = <T extends unknown>(arrayOrNotArray: T | T[]): T[] =>
  Array.isArray(arrayOrNotArray) ? arrayOrNotArray : [arrayOrNotArray]

const validateAndApplyQuery = async (
  query: ParsedUrlQuery,
  coinlist: Coin[],
): Promise<Config | undefined> => {
  const from = moment(query.from, moment.HTML5_FMT.DATE)
  const to = moment(query.to, moment.HTML5_FMT.DATE)
  const coins = Array.isArray(query.coin)
    ? coinlist.filter(({Id}) => query.coin.includes(Id))
    : [coinlist.find(({Id}) => Id === query.coin)]
  const graphType = arrayify(query.graphtype).find((graphType) =>
    /boxplot|linechart/.test(graphType),
  ) as GraphType | undefined
  console.group("validating query")
  console.log("from.isValid():", from.isValid())
  console.log("to.isValid():", to.isValid())
  console.log("from.isBefore(to):", from.isBefore(to))
  console.log("from.isBefore(yesterday):", from.isBefore(yesterday))
  console.log("to.isBefore(yesterday):", to.isBefore(yesterday))
  console.log(
    "coins.length === arrayify(query.coin).length:",
    coins.length === arrayify(query.coin).length,
  )
  console.log("graphType:", !!graphType)
  console.groupEnd()
  if (
    from.isValid() &&
    to.isValid() &&
    from.isBefore(to) &&
    from.isBefore(yesterday) &&
    to.isBefore(yesterday) &&
    coins.length === arrayify(query.coin).length &&
    graphType
  ) {
    return {from, to, coins, graphType}
  }
}

export type GraphType = "boxplot" | "linechart"

export interface Config {
  from: Moment;
  to: Moment;
  coins: Coin[];
  graphType: GraphType;
}

const Index = (): JSX.Element => {
  const styles = useStyles()
  const router = useRouter()
  const [coinlist, setCoinlist] = useState<Coin[]>([])
  const [coinlistLoadingError, setCoinlistLoadingError] = useState(false)
  const [config, setConfig] = useState<Config | undefined>()
  useEffect(() => {
    fetchCoinlist()
      .then(setCoinlist)
      .catch((error) => {
        console.error(error)
        setCoinlistLoadingError(true)
      })
  }, [])
  useEffect(() => {
    if (coinlist.length) {
      validateAndApplyQuery(router.query, coinlist).then((config) => {
        if (config) setConfig(config)
      })
    }
  }, [coinlist, router.query])
  return (
    <>
      <ConfigurationInterface
        coinlist={coinlist}
        coinlistLoadingError={coinlistLoadingError}
        config={config}
        dense={!!config}
      />
      {config ? (
        <>
          <Divider className={styles.divider} />
          <div className={styles.graph} />
        </>
      ) : undefined}
    </>
  )
}

export default Index
