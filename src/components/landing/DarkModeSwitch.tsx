import { useColorMode, IconButton } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'

export const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <></>
    // <IconButton
    //   position="fixed"
    //   top={4}
    //   right={4}
    //   icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
    //   aria-label="Toggle Theme"
    //   // bgGradient="linear(to-r, #E11860, #03ACDF)"
    //   // bgColor={"gray"}
    //   onClick={toggleColorMode}
    // />
  )
}
