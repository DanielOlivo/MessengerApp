import React, { useRef } from 'react'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { selectAllUsers } from '../../users/selectors'
import { selectContactsInGroup, selectContactsNotInGroup, selectIsOnSearch } from '../selectors'
import { Contact, ContactProps } from './Contact'
import { createGroup, setSearchStatus } from '../slice'

export const CreateWindow = () => {

    const dispatch = useApDispatch()

    const inGroup = useAppSelector(selectContactsInGroup)
    const notInGroup = useAppSelector(selectContactsNotInGroup)

    const propsNotInGroup: ContactProps[] = notInGroup.map(user => ({
        ...user,
        userId: user.id,
        editable: true,
        inGroup: false
    }))

    const nameRef = useRef<HTMLInputElement>(null)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value

        if(value.length === 0){
            dispatch(setSearchStatus(false))
            return
        }
        dispatch(setSearchStatus(true))
    } 

    const submit = () => {
        if(nameRef.current && nameRef.current.value.length > 0 && inGroup.length > 0){
            dispatch(createGroup({
                name: nameRef.current.value,
                users: inGroup.map(user => user.id)
            }))            
        }
    }

    return (
        <div className='flex flex-col justify-start items-start p-2'>

            <input placeholder='group name' ref={nameRef}/>

            <input placeholder='search' onChange={handleSearch}/>

            <div className='w-full h-48 overflow-y-auto'>
                <div>
                    {inGroup.length > 0 && (
                        <>
                            <p>Members</p> 
                            {inGroup.map(props => <Contact key={props.userId} {...props} />)}
                        </>
                    )}

                    <p>All contacts</p>
                    {propsNotInGroup.map(props => <Contact key={props.userId} {...props} />)}
                </div>
            </div>     

            <button onClick={submit}>Create</button>

        </div>
    )
}
