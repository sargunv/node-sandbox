import {
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react"
import { useCallback, useState } from "react"
import type { Ticket } from "wave2go-ticket-scraper"

import TicketBox from "../components/TicketBox"
import TicketLookup from "../components/TicketLookup"

export default function Home() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const toast = useToast()

  const onTicketFound = useCallback((ticket: Ticket) => {
    setTicket(ticket)
  }, [])

  const onLookupError = useCallback(
    (error: Error) => {
      toast({
        title: "An error occurred while fetching the ticket",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    },
    [toast],
  )

  const onPassError = useCallback(
    (error: Error) => {
      toast({
        title: "An error occurred while generating the pass",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    },
    [toast],
  )

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading as="h1" fontSize="4xl">
            Wallet Pass Generator
          </Heading>
          <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.400")}>
            for Washington State Ferries tickets ⛴️
          </Text>
        </Stack>
        <TicketLookup onTicketFound={onTicketFound} onError={onLookupError} />
        {ticket && <TicketBox ticket={ticket} onError={onPassError} />}
      </Stack>
    </Flex>
  )
}
