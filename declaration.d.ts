declare module "*.svg" {
  import { FC } from "react"

  import { SvgProps } from "react-native-svg"
  const content: FC<SvgProps>
  export default content
}

declare module "@env" {
  export const {
    SIP_USERNAME,
    SIP_PASSWORD,
    SIP_DOMAIN,
    PLACES_AUTOCOMPLETE_URL,
    PLACES_API_TOKEN,
    GOOGLE_API_KEY,
    PUSHER_KEY,
    AUTH_API_URL,
    MOBILE_API_URL
  }: Record<string, string>
  export const { MIXPANEL_TOKEN }: Record<string, string>
}
