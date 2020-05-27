import MuiLink from "@material-ui/core/Link"
import Typography from "@material-ui/core/Typography"

const text1 = "This app fetches data from "
const text2 = "CryptoCompare.com"

const cryptoCompareURL = "https://min-api.cryptocompare.com/"

const About = (): JSX.Element => (
  <Typography>
    {text1}
    <MuiLink href={cryptoCompareURL}>{text2}</MuiLink>
  </Typography>
)

export default About
