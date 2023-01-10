import Head from 'next/head';
import React from 'react'
import Position from '../components/portfolio/position';

export default function position() {
  return (
    <>
        <Head>
				<title>
					Position | ZEXE |
					Buy & Sell Crypto on ZEXE
				</title>
				<link rel="icon" type="image/x-icon" href="/favicon.png"></link>
			</Head>
        <Position/>
    </>
  )
}
