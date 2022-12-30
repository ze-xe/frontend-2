import React from "react";
import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	InputRightAddon,
	Text,
	InputGroup,
	Input,
	InputLeftAddon,
	Box,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
	Button,
	Tooltip,
} from "@chakra-ui/react";

import Image from "next/image";
import { isValidNS } from '../../utils/number';

export default function NumberInputWithSlider({
	onUpdate,
	asset,
	max,
	value: _value,
	min = 0,
	color = "#3EE6C4",
}: any) {
	const [value, setValue] = React.useState(0);
	const handleChange = (__value: any) => {
		setValue(__value)
		onUpdate(__value);
	}

	const labelStyles = {
		mt: "-4px",
		ml: "-1.5",
	};

	const boxStyle = {
		h: 2,
		w: 2,
		borderRadius: 100,
	};

	return (
		<Box>
			<InputGroup>
				<NumberInput
					width={"100%"}
					value={value}
					onChange={handleChange}
					precision={asset?.decimals ? asset.decimals - 10 : 8}
					max={max}
					min={0}
					variant="filled"
					border={"1px"}
					borderColor={"gray.700"}
				>
					<NumberInputField borderRadius={0} />
					<NumberInputStepper>
						<NumberIncrementStepper />
						<NumberDecrementStepper />
					</NumberInputStepper>
				</NumberInput>
			</InputGroup>

			
			<Slider
				defaultValue={30}
				onChange={(e) => handleChange(e*max/100)}
				value={(value * 100) / max}
				focusThumbOnChange={false}
				mt={2}
				step={0.1}
				width="97%"
                ml={1.5}
			>
				<SliderMark value={0} {...labelStyles}>
					<Box
						{...boxStyle}
						bgColor={(value * 100) / max < 0 ? "background1" : color}
						borderColor={(value * 100) / max < 0 ? 'gray.800' : color}
					></Box>
				</SliderMark>
				<SliderMark value={25} {...labelStyles}>
					<Box
						{...boxStyle}
						bgColor={(value * 100) / max < 25 ? "background1" : color}
						border='1px solid'
						borderColor={(value * 100) / max < 25 ? 'gray.800' : color}
					></Box>
				</SliderMark>
				<SliderMark value={50} {...labelStyles}>
					<Box
						{...boxStyle}
						bgColor={(value * 100) / max < 50 ? "background1" : color}
						border='1px solid'
						borderColor={(value * 100) / max < 50 ? 'gray.800' : color}
					></Box>
				</SliderMark>
				<SliderMark value={75} {...labelStyles}>
					<Box
						{...boxStyle}
						bgColor={(value * 100) / max < 75 ? "background1" : color}
						border='1px solid'
						borderColor={(value * 100) / max < 75 ? 'gray.800' : color}
					></Box>
				</SliderMark>
				<SliderMark value={100} {...labelStyles} opacity='1'>
					<Box
						{...boxStyle}
						bgColor={(value * 100) / max < 100 ? "background1" : color}
						border='1px solid'
						borderColor={(value * 100) / max < 100 ? 'gray.800' : color}
					></Box>
				</SliderMark>

				<SliderTrack >
					<SliderFilledTrack bgColor={color} />
				</SliderTrack>
				<Tooltip fontSize={'xs'} label={(isNaN((value * 100) / max) ? 0 : (value * 100) / max) + '%'} >
				<SliderThumb bgColor={color} />
				</Tooltip>
			</Slider>
		</Box>
	);
}
