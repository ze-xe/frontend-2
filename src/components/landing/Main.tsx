import { Stack, StackProps } from '@chakra-ui/react'

export const Main = (props: StackProps) => (
  <Stack
    spacing="1.5rem"
    width="100%"
    // height={"60vh"}
    maxWidth="48rem"
    // mt="-30vh"
    pt="2rem"
    px="1rem"
    {...props}
    align="center"
  />
)
