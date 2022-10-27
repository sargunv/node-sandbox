import {
  Box,
  Button,
  Heading,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react"
import { useCallback, useState } from "react"
import type { Ticket } from "wave2go-ticket-scraper"

import TicketTable from "./TicketTable"

export default function TicketBox(props: {
  ticket: Ticket
  onError: (error: Error) => void
}) {
  const { ticket, onError } = props

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = useCallback(() => {
    void (async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/generate_pass?visualId=${ticket.visualId}`,
        )
        if (response.status === 200) {
          const pass = await response.blob()
          const url = window.URL.createObjectURL(pass)
          const a = document.createElement("a")
          a.href = url
          a.download = `${ticket.visualId}.pkpass`
          a.click()
          window.URL.revokeObjectURL(url)
        } else {
          throw new Error(`Failed to generate pass`)
        }
      } catch (err: any) {
        onError(err instanceof Error ? err : new Error(err))
      } finally {
        setIsLoading(false)
      }
    })()
  }, [onError, ticket.visualId])

  return (
    <Box
      rounded="lg"
      bg={useColorModeValue("white", "gray.700")}
      boxShadow="lg"
      p={8}
    >
      <Stack spacing={4}>
        <Heading as="h2" fontSize="2xl">
          Wave2Go Ticket
        </Heading>
        <TicketTable ticket={ticket} />
        <Stack spacing={10}>
          <Button
            bg="blue.400"
            color="white"
            _hover={{
              bg: "blue.500",
            }}
            disabled={isLoading}
            isLoading={isLoading}
            onClick={onSubmit}
          >
            Download for Apple Wallet
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
