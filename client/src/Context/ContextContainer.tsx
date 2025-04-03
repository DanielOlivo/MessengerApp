import React, { FC, PropsWithChildren, ReactNode, useEffect, useRef} from 'react'
import { createPortal } from 'react-dom'
import { ContextType, disable, setVisible } from './slice'
import { useApDispatch, useAppSelector } from '../app/hooks'
import { selectId, selectType, selectX, selectY } from './selectors'

export interface ContextContainerProps {
    id: string
    type: ContextType
    getMenu: () => ReactNode
}


export const ContextContainer: FC<PropsWithChildren<ContextContainerProps>> = ({id, type, getMenu, children}) => {

    const dispatch = useApDispatch()

    const divRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const currentType = useAppSelector(selectType) 
    const currentId = useAppSelector(selectId)
    const x = useAppSelector(selectX)
    const y = useAppSelector(selectY)

    const visible = id === currentId && type === currentType

    const handleClickOutside = (e: MouseEvent) => {
        if(menuRef.current && !menuRef.current.contains(e.target as Node)){
            dispatch(disable())
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div
            ref={divRef}            
            onContextMenu={(e) => {
                e.preventDefault()
                console.log('dispatching')
                dispatch(setVisible({
                    id, type, position: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }))
            }}
        >
            {children}

            {visible && (createPortal(
                <div
                    className='absolute' 
                    ref={menuRef}
                    style={{left: x, top: y}}
                >{getMenu()}</div>, 
                document.body))}
        </div>
    )
}
