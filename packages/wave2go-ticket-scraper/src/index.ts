// based on code donated by @jordansoltman, the developer for Ferry Friend on iOS

import { format, parse } from "date-fns"
import { enUS } from "date-fns/locale"
import { JSDOM } from "jsdom"
import * as t from "typanion"

const isTicket = t.isObject({
  visualId: t.isString(),
  plu: t.isString(),
  price: t.isString(),
  status: t.isString(),
  expirationDate: t.isString(),
  usesRemaining: t.isNumber(),
  itemName: t.isString(),
  description: t.isString(),
})

export type Ticket = t.InferType<typeof isTicket>

const DATA_TO_FIELD = new Map<string, keyof Ticket>([
  ["VisualId", "visualId"],
  ["Plu", "plu"],
  ["Price", "price"],
  ["Status", "status"],
  ["ExpirationDate", "expirationDate"],
  ["TotalRemainingUses", "usesRemaining"],
  ["ItemName", "itemName"],
  ["Description", "description"],
])

type ScrapeResult =
  | {
      status: "found"
      ticket: Ticket
    }
  | {
      status: "not_found"
    }

export const scrapeTicket = async (visualId: string): Promise<ScrapeResult> => {
  const landing = await JSDOM.fromURL(
    "https://wave2go.wsdot.com/WebStore/landingPage?cg=21&c=76",
  )
  const lookup = await JSDOM.fromURL(
    `https://wave2go.wsdot.com/webstore/account/ticketLookup.aspx?VisualID=${visualId}`,
    { cookieJar: landing.cookieJar },
  )

  const section = lookup.window.document.querySelector("#TicketLookup")

  if (!section) {
    return { status: "not_found" }
  }

  const spans = Array.from(section.querySelectorAll("span"))

  if (spans.length === 0) {
    return { status: "not_found" }
  }

  const ticket: Partial<Ticket> = {}
  spans.forEach((span) => {
    const key = span.getAttribute("data-text")

    if (!key || !DATA_TO_FIELD.has(key)) {
      return
    }

    const field = DATA_TO_FIELD.get(key)! // map.has() check above

    const value = span.textContent ?? ""

    if (field === "expirationDate") {
      const parsedDate = parse(value, "LLLL d, yyyy", new Date(), {
        locale: enUS,
      })
      // eslint-disable-next-line security/detect-object-injection -- see inferred type of `field`
      ticket[field] = format(parsedDate, "yyyy-MM-dd", { locale: enUS })
    } else if (field === "usesRemaining") {
      // eslint-disable-next-line security/detect-object-injection -- see inferred type of `field`
      ticket[field] = Number(value)
    } else {
      // eslint-disable-next-line security/detect-object-injection -- see inferred type of `field`
      ticket[field] = value
    }
  })

  if (!isTicket(ticket)) {
    throw new Error("failed type guard")
  }

  return { status: "found", ticket }
}
