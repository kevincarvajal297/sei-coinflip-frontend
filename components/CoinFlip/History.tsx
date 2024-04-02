import { useState, useEffect, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'


import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'

import axios from 'axios';
import Link from 'next/link';
import ReactPaginate from 'react-paginate';
const ascen = '../images/sort_asc.png';
const descen = '../images/sort_desc.png';
import {NotificationContainer, NotificationManager} from 'react-notifications'
import moment from 'moment'
import { useSigningClient } from '../../contexts/cosmwasm'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import Select from 'react-select'

const options = [
  { value: 0, label: 'All' },
  { value: 1, label: 'Started' },
  { value: 2, label: 'Not Started' }
]

import {
    convertMicroDenomToDenom, 
    convertDenomToMicroDenom,
    convertFromMicroDenom
  } from '../../util/conversion'

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '0px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const History = () => {
  const { 
    walletAddress,
    signingClient,
    getHistory,
    historyList

  } = useSigningClient()

  const [newData, setnewData] = useState([]);
  
  //search
  const [q, setQ] = useState('');
  //selec value
  const [value, setValue] = useState(10);

  //paginate
  const [pageNumber, setpageNumber] = useState(0)
  const coinsPerPage = 10;
  const pagesVisited = pageNumber * coinsPerPage;
  const [pageCount, setPageCount] = useState(0)
  const changePage = ({ selected }) => {
    setpageNumber(selected);
  };

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      setnewData(null)
      return
    }
    getHistory()
  }, [signingClient, walletAddress])

  useEffect(() => {
    if (historyList == null) {
      return
    }
    setnewData(historyList)
    setPageCount(Math.ceil(historyList.length / coinsPerPage))

  }, [historyList])


  const search = (rows) => {
    return rows.filter((row) => 
    (
        (
            row.address.toLowerCase().indexOf(q.toLocaleLowerCase()) > -1
        )
    ));
  };


  return (
    <>
      <div className='pt-100 pb-10'>
        <div className='container'>
          <div className='section-title'>
            <h2>
              Flip History
            </h2>
          </div>
          
        </div>
      </div>
      <div className='container pb-10'>
        <div className='row'>
          <div className='price-filter'>
            

            <div className='col-md-3 d-flex align-items-center'>
              <span className="col-md-3">Address Search:{' '}</span>
              <input
                type='text'
                className='crypto-search col-md-9'
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          
          <div className='cryptocurrency-table table-responsive'>

            <div className='row align-items-center justify-content-center'>
                <div className='mb-3 row'>
                    <h4 className="p-2 col-md-1">Id</h4>
                    <h4 className="p-2 col-md-2">DateTime</h4>
                    <h4 className="p-2 col-md-6">Address</h4>
                    <h4 className="p-2 col-md-1">Level</h4>
                    <h4 className="p-2 col-md-1">State</h4>
                    <h4 className="p-2 col-md-1">Reward Amount</h4>
                    
                </div>

              {newData &&
                newData.length > 0 &&
                search(newData)
                  .slice(0 || pagesVisited, pagesVisited + coinsPerPage)
                  .map((data) => (
                    
                    <div className='mb-3 row'>
                        <h4 className="p-2 col-md-1">{data.id}</h4>
                        <h4 className="p-2 col-md-2">{moment(new Date(data.timestamp * 1000)).format('YYYY/MM/DD HH:mm:ss')}</h4>
                        <h4 className="p-2 col-md-6">{data.address}</h4>
                        <h4 className="p-2 col-md-1">{data.level}</h4>
                        <h4 className="p-2 col-md-1">{data.win ? "Win" : "Lose"}</h4>
                        <h4 className="p-2 col-md-1">{convertMicroDenomToDenom(data.reward_amount)}</h4>
                    </div>
                
                  ))}

            </div>
            

            <div className='count-pagination'>
              <p className='price-count'>
                {/* Showing 1 to 20 of {newData?.length} entries */}
              </p>

              <div className='pagination'>
                <ReactPaginate
                  previousLabel={'<'}
                  nextLabel={'>'}
                  pageCount={pageCount}
                  onPageChange={changePage}
                  activeClassName='current'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
