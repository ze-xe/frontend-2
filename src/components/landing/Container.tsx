import { Flex, FlexProps } from '@chakra-ui/react'

export const Container = (props: FlexProps) => (
  <Flex
    direction="column"
    alignItems="center"
    justifyContent="flex-start"
    height={"100vh"}
    bg="gray.50"
    color="black"
    _dark={{
      bg: 'gray.1000',
      color: 'white',
    }}
    transition="all 0.15s ease-out"
    {...props}
  />
)
