import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, createContext, useContext, useEffect } from 'react'
//top header
import TopHeader from './TopHeader';

//navbar
import Navbar from './Navbar';

//footer
import Footer from './Footer';
import ThemeContext from '../../contexts/ThemeContext'
import useTheme from '../../hooks/useTheme'
import styled from 'styled-components'

const Wrapper = styled.div`
  background: ${props => {
    switch (props.slot) {
      case '/gFOTmodule':
        return !props.defaultChecked ? 'white' : `linear-gradient(180deg, #8394DD 0%, #FFFFFF 100%)`
      case '/fortisDungeon':
        return `var(--background-color)`
      case '/communitySale':
        return !props.defaultChecked
          ? `url('/images/MacBook Pro 14_ - 2.png')`
          : `linear-gradient(180deg, #8394DD 0%, #FFFFFF 100%)`
      default:
        return `linear-gradient(180deg, #8394DD 0%, #FFFFFF 100%)`
    }
  }};
  background-repeat: round;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: ${props =>
    !props.defaultChecked && props.slot === '/sFOTVault'
      ? 'hue-rotate(240deg)'
      : !props.defaultChecked && props.slot === '/castleDex'
      ? 'hue-rotate(15deg)'
      : ''};
`
export const ToggleContext = createContext({
  toggle: false,
  setToggle: null,
  asset: 0,
  setAsset: null,
  page: 0,
  setPage: null,
})

const Layout = ({ children }) => {
  const router = useRouter();
  const { pathname } = router;

  const themeContext = useTheme('theme1')

  const [toggle, setToggle] = useState(false)
  const [page, setPage] = useState(0)
  const [asset, setAsset] = useState(0)

  useEffect(() => {
    let temp = localStorage.getItem('toggle')
    if (temp) {
      setToggle(JSON.parse(temp))
    }
  }, [])

  return (
    <>
    <ThemeContext.Provider value={themeContext}>
    <ToggleContext.Provider value={{ toggle, setToggle, asset, setAsset, page, setPage }}>
    <Wrapper
          defaultChecked={toggle}
          slot={pathname}
          style={{
            filter:
              toggle &&
              'drop-shadow(16px 16px 20px) invert(90) hue-rotate(170deg) saturate(200%) contrast(100%) brightness(90%)',
            
          }}
        >
      <Head>
        <title>CoinFlip</title>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
        <meta
          name='description'
          content='CoinFlip'
        />
        <meta
          name='og:title'
          property='og:title'
          content='CoinFlip'
        ></meta>
        <meta
          name='twitter:card'
          content='CoinFlip'
        ></meta>
        
      </Head>

      {/* {pathname === '/' ? <TopHeader /> : ''} */}
      <Navbar 
        toggle={toggle}
        setToggle={toggle => {
        localStorage.setItem('toggle', toggle.toString())
        setToggle(toggle)
      }}
      />
  
      {children}

      <Footer />
      </Wrapper>
    </ToggleContext.Provider>
    </ThemeContext.Provider>
    </>
  );
};

export default Layout;
