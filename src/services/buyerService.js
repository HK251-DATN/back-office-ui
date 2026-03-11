import { buyers } from "../mocks/buyers"

export const getBuyers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buyers)
    }, 500)
  })
}