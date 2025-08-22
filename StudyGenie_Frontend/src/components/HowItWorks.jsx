import React from 'react'
import '../style/HowItWorks.style.css'

function HowItWorks() {
  return (
    <div className='howItWorks-main'>
        <h2 className='header-HowitWorks-1'>How It Works</h2>
        <div className='block-How'>
            <div className='block-how-1'>
                <h3 className='block-how-1-header-1'>Upload PDF</h3>
                <div className='bloack-how-1-pic-1'></div>
            </div>
            <div className='block-how-2'>
                <h3 className='block-how-2-header-1'>Summarize and Quiz</h3>
                <div className='bloack-how-2-pic-1'></div>
            </div>
            <div className='block-how-3'>
                <h3 className='block-how-3-header-1'>Practice Interviews</h3>
                <div className='bloack-how-3-pic-1'></div>
            </div>
        </div>
    </div>
  )
}

export default HowItWorks