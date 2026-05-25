import { GetVersion as WailsGetVersion } from '../../wailsjs/go/main/App'

export async function getVersion(): Promise<string> {
  return WailsGetVersion()
}
