import { Box, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import dynamic from "next/dynamic";

const Graph = dynamic(
	() =>
		import('./Graph.jsx').then(mod => mod.Graph),
	{ ssr: false },
);

export default function GraphPanel({pair}) {
  return (
    <>
    <Flex flexDir={"column"} justify="center" bgColor="background2" my={1} zIndex={-1} maxH='600'>
       {pair && <Graph symbol={pair?.tokens[0].symbol + '_' + pair?.tokens[1].symbol}/>}
    </Flex>
    </>
  )
}
