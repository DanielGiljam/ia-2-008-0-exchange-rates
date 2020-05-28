import {Datum} from "./cryptocompare"

export interface GraphProps {
  data: Datum[];
  container: HTMLDivElement;
}

export type GraphFunction = (props: GraphProps) => string
