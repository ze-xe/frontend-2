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
            router.push('/margin/' + pairs[0].tokens[0].symbol + '_' + pairs[0].tokens[1].symbol)
        }
    })
    return (
        <></>
    )
}
