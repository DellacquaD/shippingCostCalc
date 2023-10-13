import * as React from 'react';
import Home from './Home.jsx'
import styles from "./Styles.module.css"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function BasicDateCalendar() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Home styles={styles} />
    </LocalizationProvider>
  );
}

