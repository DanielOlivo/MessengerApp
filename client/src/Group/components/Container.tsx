import React, { FC, PropsWithChildren } from 'react'

export const Container: FC<PropsWithChildren> = ({children}) => {
  return (
    <div>
        Container
        {children} 
    </div>
  )
}
