import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";
import { NextSeo } from "next-seo";

export default class Document extends NextDocument {
	render() {
		return (
			<Html>
				<Head>
					<script src="/static/datafeeds/udf/dist/bundle.js" />
				</Head>
				<body>
					{/* Make Color mode to persists when you refresh the page. */}
					<ColorModeScript />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
