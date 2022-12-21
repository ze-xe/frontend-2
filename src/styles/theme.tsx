import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import { createBreakpoints, mode, StyleFunctionProps } from '@chakra-ui/theme-tools'
import { StepsStyleConfig as Steps } from 'chakra-ui-steps';

const fonts = { mono: `'Menlo', monospace` }

const breakpoints = createBreakpoints({
  sm: '425px',
  md: '1100px',
  lg: '1440px',
  xl: '1600px',
})

const config: ThemeConfig = {
  useSystemColorMode: false,
	initialColorMode: 'dark',
};

const theme = extendTheme({
  config: config,
  semanticTokens: {
    colors: {
      // text: {
      //   default: '#16161D',
      //   _dark: '#ade3b8',
      // },
      // heroGradientStart: {
      //   default: '#7928CA',
      //   _dark: '#e3a7f9',
      // },
      // heroGradientEnd: {
      //   default: '#FF0080',
      //   _dark: '#fbec8f',
      // },
    },
    radii: {
      button: '12px',
    },
  },
  colors: {
    black: '#000',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      1000: '#161616',
      1100: '#111111'
    },
    // green: '#228B22',
    // red: '#D82626',
    green2: '#18B05F',
    red2: '#C83232',
    primary: '#F60DC9',
    background1: '#0E0020',
    background2: '#130B25',
  },
  fonts,
  breakpoints,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        fontFamily: 'body',
        color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode('white', '#0E0020')(props),
        lineHeight: 'base',
      },
    }),
  },
  components: {
    Steps,
    Button: {
      baseStyle: {
        borderRadius: '0px'
      }
    },
    Input: {
      baseStyle: {
        borderRadius: '2px'
      }
    },
    NumberInput: {
      baseStyle: {
        borderRadius: '0px',
      }
    },
    InputGroup: {
      baseStyle: {
        borderRadius: '0px'
      }
    },
    InputLeftElement: {
      baseStyle: {
        borderRadius: '0px'
      }
    }
  }
})


export default theme
