import React, { FC, PropsWithChildren } from 'react'
import { useApDispatch } from '../../app/hooks'
import { setState } from '../slice'

export const Container: FC<PropsWithChildren> = ({children}) => {

    const dispatch = useApDispatch()

    const close = () => dispatch(setState('idle'))

    return (
        <div 
            className='absolute top-0 left-0 w-full h-full flex justify-center items-center bg-[rgba(0,0,0,0.4)]' 
            // onClick={close}
        >
            <div className='bg-white w-1/2 h-2/3 flex flex-col justify-start items-stretch'>
                <div className='w-full flex-row-reverse justify-start items-center'>
                    <button aria-label='close-controls' onClick={close}>Close</button>
                </div>
                <div>
                    {children} 
                </div>
            </div>
        </div>
  )
}
