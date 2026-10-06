import {MD3DarkTheme, MD3LightTheme, type MD3Theme} from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5B5FEF',
    secondary: '#65708A',
    background: '#F6F7FB',
    surface: '#FFFFFF',
    error: '#C83B4D',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A5A7FF',
    secondary: '#B5BCD0',
    background: '#11131A',
    surface: '#1B1E28',
    error: '#FF8A96',
  },
};
