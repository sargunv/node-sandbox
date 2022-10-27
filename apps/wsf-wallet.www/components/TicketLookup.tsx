import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react"
import { ChangeEventHandler, useCallback, useState } from "react"
import type { Ticket } from "wave2go-ticket-scraper"

export default function TicketLookup(props: {
  onTicketFound: (ticket: Ticket) => void
  onError: (error: Error) => void
}) {
  const { onTicketFound, onError } = props

  const [visualId, setVisualId] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onEdit: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setErrorMessage(null)
    setVisualId(event.target.value)
  }, [])

  const onSubmit = useCallback(() => {
    void (async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const response = await fetch(`/api/get_ticket/?visualId=${visualId}`)
        if (response.status === 200) {
          const result = (await response.json()) as { ticket: Ticket }
          onTicketFound(result.ticket)
        } else {
          setErrorMessage("Ticket not found")
        }
      } catch (err: any) {
        onError(err instanceof Error ? err : new Error(err))
      } finally {
        setIsLoading(false)
      }
    })()
  }, [onError, onTicketFound, visualId])

  return (
    <Box
      rounded="lg"
      bg={useColorModeValue("white", "gray.700")}
      boxShadow="lg"
      p={8}
    >
      <Stack spacing={4}>
        <Heading as="h2" fontSize="2xl">
          Ticket Lookup
        </Heading>
        <FormControl isInvalid={!!errorMessage}>
          <Input
            value={visualId}
            onChange={onEdit}
            maxLength={48}
            pattern="\d*"
            disabled={isLoading}
            placeholder="Enter the ticket number"
          />
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        </FormControl>
        <Stack spacing={10}>
          <Button
            bg="blue.400"
            color="white"
            _hover={{
              bg: "blue.500",
            }}
            disabled={isLoading || visualId.length === 0}
            isLoading={isLoading}
            onClick={onSubmit}
          >
            Look up ticket
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
