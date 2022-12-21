import React from 'react'
import { useRouter } from 'next/router'
import { Box, Text, Flex } from '@chakra-ui/react'
import { useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataProvider';

export default function trade() {
    
    const router = useRouter();
    const {pairs} = useContext(DataContext);

    useEffect(() => {
        if(pairs.length > 0){
            router.push('/trade/' + pairs[0].tokens[0].symbol + '_' + pairs[0].tokens[1].symbol)
        }
    })
    return (
        <>
        <Flex align={'center'} justify='center' height={'90vh'}>
            {/* {(!isConnecting && !isConnecting) && <Box border='1px #E11860' borderColor={'#E11860'}>
                <Text>Please connect your wallet to continue</Text>
            </Box>} */}
        </Flex>
        </>
    )
}
