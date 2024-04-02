import { useEffect, useState, MouseEvent, ChangeEvent } from 'react'
import TextField from '@mui/material/TextField'
import {NotificationContainer, NotificationManager} from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useSigningClient } from '../../contexts/cosmwasm'
import { fromBase64, toBase64 } from '@cosmjs/encoding'

const Flip = () => {

  
  const { 
    walletAddress,
    signingClient,
    executeFlip

  } = useSigningClient()

  //Work Variables
  
  const [level, setLevel] = useState(1)


  const handleSubmit = async (event: MouseEvent<HTMLElement>) => {
    if (!signingClient || walletAddress.length === 0) {
      NotificationManager.error('Please connect wallet first')  
      return
    }
    event.preventDefault()
    executeFlip(level)
  }

  return (
    <>
      <div className='ptb-100'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-6 col-md-12'>
              <div className=''>
                <h1>
                  <span>Earn Double Juno With One Flip</span>
                </h1>
                
              </div>
            </div>
            <div className='col-lg-6 col-md-12'>
              <div className='trade-cryptocurrency-box'>
                
                <div className='currency-selection'>
                    <FormControl fullWidth variant="standard" sx={{ m: 1, minWidth: 250 }}>
                        <h4>Juno amount</h4>
                        <p/>
                        <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            defaultValue={1}
                            value={level}
                            onChange={(event) => {
                                setLevel(parseInt(event.target.value.toString()))
                              }}
                            label="Juno Amount"
                        >
                        
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="row col-md-12">
                
                    
                    
                </div>
                <button type='submit'
                onClick={handleSubmit}
                >
                  <i className='bx bxs-hand-right'></i> Flip
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default Flip;
