import React from 'react';
import '../style/NavigationLanding.style.css'
import { useNavigate } from 'react-router-dom';

function NavLandingPage() {
  const navigate = useNavigate()
  const HandleStarted = () => {
    navigate('/signin')
  }
  return (
    <div className='navigation-main'>
      <div className='navigation-inner'>
        <div className='header1-nav-wrap'>
          <h1 className='header1-1-nav'>
            MASTER SMARTER,<br />NOT HARDER
          </h1>
        </div>
        <div className='header2-nav-wrap'>
          <h2 className='header2-2-nav'>
            Learn, Summarize, Practice with AI
          </h2>
        </div>
        <div className='buttons-wrap-nav'>
            <button className='getStarted'onClick={HandleStarted}>Get Started</button>
        </div>
      </div>
      <div className='Logo-nav-wrap-land'>
      </div>
    </div>
  );
}

export default NavLandingPage;
