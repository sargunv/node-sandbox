import type { NextApiRequest, NextApiResponse } from "next"
import * as t from "typanion"
import { scrapeTicket } from "wave2go-ticket-scraper"

const isValidQuery = t.isObject({
  visualId: t.cascade(t.isString(), [t.matchesRegExp(/^\d+$/)]),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!isValidQuery(req.query)) {
    res.status(400).json({ error: "invalid query" })
    return
  }

  const scrapeResult = await scrapeTicket(req.query.visualId)

  if (scrapeResult.status === "not_found") {
    res.status(404).json({ error: "ticket not found" })
    return
  }

  const { ticket } = scrapeResult
  res.status(200).json({ ticket })
}

export default handler
