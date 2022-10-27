import path from "path"

import { add, parse } from "date-fns"
import { zonedTimeToUtc } from "date-fns-tz"
import type { NextApiRequest, NextApiResponse } from "next"
import absoluteUrl from "next-absolute-url"
import { PKPass } from "passkit-generator"
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

  const pass = await PKPass.from(
    {
      model: path.join(process.cwd(), "Ticket.pass"),
      certificates: {
        wwdr: process.env.WWDR_PEM!,
        signerCert: process.env.SIGNER_CERT_PEM!,
        signerKey: process.env.SIGNER_KEY_PEM!,
        signerKeyPassphrase: process.env.SIGNER_KEY_PASSPHRASE!,
      },
    },
    {
      serialNumber: ticket.visualId,
      description: ticket.description,
      voided: ticket.status === "Invalid",
      userInfo: { ticket },
    },
  )

  pass.transitType = "PKTransitTypeBoat"

  pass.setBarcodes({
    message: req.query.visualId,
    format: "PKBarcodeFormatCode128",
    altText: req.query.visualId,
  })

  const parsedDate = parse(ticket.expirationDate, "yyyy-MM-dd", new Date())
  const utcDate = zonedTimeToUtc(parsedDate, "America/Los_Angeles")
  pass.setExpirationDate(add(utcDate, { days: 1 }))

  // TODO get terminal location from wsdot ferries api
  // pass.setLocations({
  //   latitude: 37.8044,
  //   longitude: -122.2711,
  // });

  const route = ticket.description.split(" ")[0]

  pass.headerFields.push(
    { key: "left", label: "Left", value: ticket.usesRemaining },
    { key: "route", label: "Route", value: route },
  )

  const [originCode, destCode] = route.split("-").map((s) => s.toUpperCase())
  pass.primaryFields.push(
    { key: "origin", label: "Origin", value: originCode },
    { key: "destination", label: "Destination", value: destCode },
  )

  pass.auxiliaryFields.push(
    { key: "description", label: "Description", value: ticket.description },
    { key: "status", label: "Status", value: ticket.status },
  )

  pass.secondaryFields.push(
    {
      key: "validThrough",
      label: "Valid Through",
      value: utcDate,
      dateStyle: "PKDateStyleLong",
      timeStyle: "PKDateStyleNone",
    },
    {
      key: "lastRefreshed",
      label: "Last Refreshed",
      value: new Date(),
      dateStyle: "PKDateStyleLong",
      timeStyle: "PKDateStyleShort",
      isRelative: true,
    },
  )

  const url = `${absoluteUrl(req).origin}${req.url ?? ""}`

  pass.backFields.push(
    { key: "visualId", label: "Visual ID", value: ticket.visualId },
    { key: "plu", label: "PLU", value: ticket.plu },
    { key: "price", label: "Price", value: ticket.price },
    { key: "itemName", label: "Item Name", value: ticket.itemName },
    {
      key: "refreshLink",
      label: "Refresh",
      value: `<a href="${url}">Tap here in the Wallet app to refresh pass</a>`,
    },
  )

  res
    .status(200)
    .setHeader("Content-Type", "application/vnd.apple.pkpass")
    .send(pass.getAsBuffer())
}

export default handler
