import { Table, TableContainer, Tbody, Td, Th, Tr } from "@chakra-ui/react"
import type { Ticket } from "wave2go-ticket-scraper"

export default function TicketTable(props: { ticket: Ticket }) {
  const { ticket } = props

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Tbody>
          <Tr>
            <Th>Visual ID</Th>
            <Td>{ticket.visualId}</Td>
          </Tr>
          <Tr>
            <Th>PLU</Th>
            <Td>{ticket.plu}</Td>
          </Tr>
          <Tr>
            <Th>Price</Th>
            <Td>{ticket.price}</Td>
          </Tr>
          <Tr>
            <Th>Status</Th>
            <Td>{ticket.status}</Td>
          </Tr>
          <Tr>
            <Th>Expiration</Th>
            <Td>{ticket.expirationDate}</Td>
          </Tr>
          <Tr>
            <Th>Uses Remaining</Th>
            <Td>{ticket.usesRemaining}</Td>
          </Tr>
          <Tr>
            <Th>Item name</Th>
            <Td>{ticket.itemName}</Td>
          </Tr>
          <Tr>
            <Th>Description</Th>
            <Td>{ticket.description}</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  )
}
