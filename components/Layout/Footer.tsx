import Link from 'next/link';

const Footer = () => {
  return (
    <>
      <footer className=''>
        
        <div className=''>
          <div className='container'>
            <p>
              Copyright 2022 <strong>CoinFlip</strong>. All Rights Reserved by{' '}
              <Link href='#'>
                <a target='_blank'>CoinFlip</a>
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
