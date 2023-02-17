import { Box, Button, Flex, Text } from '@chakra-ui/react';
import Router from 'next/router';
import React from 'react'
import { BiExit } from 'react-icons/bi';
import { useDisconnect } from 'wagmi';

export default function Index() {
    const { disconnect } = useDisconnect();

    const _disconnect = () => {
        disconnect();
        Router.push('/trade');
    }
  return (
    <Flex flexDir={'column'} width={'100%'} bgColor={'background2'} justify='center' align={'center'} py={5}>

    <Text mb={5} fontSize='xl' fontWeight={'bold'}>Confirm signing out of zexe</Text>

    <Flex gap={2}>

    <Button onClick={_disconnect}>
        <Text mr={2}>Sign out</Text> <BiExit/>
    </Button>
    <Button onClick={() => Router.push('/trade')}>
        <Text mr={2}>Cancel</Text>
    </Button>
    </Flex>
    </Flex>
  )
}
