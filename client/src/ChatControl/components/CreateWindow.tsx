import React, { useRef } from 'react'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { selectContactsInGroup, selectContactsNotInGroup, selectMemberProps, selectNonMemberProps } from '../selectors'
import { Contact, ContactProps } from './Contact'
import { createGroup, searchContact, setIdle, setSearchStatus } from '../slice'

export const CreateWindow = () => {

    const dispatch = useApDispatch()

    // redo selectors here

    const inGroup = useAppSelector(selectContactsInGroup)
    // const inGroup = useAppSelector(selectMemberProps)
    const notInGroup = useAppSelector(selectContactsNotInGroup)
    // const notInGroup = useAppSelector(selectNonMemberProps)

    const propsNotInGroup: ContactProps[] = notInGroup.map(user => ({
        ...user,
        userId: user.userId,
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
        dispatch(searchContact(value))
    } 

    const submit = () => {
        if(nameRef.current && nameRef.current.value.length > 0 && inGroup.length > 0){
            dispatch(createGroup({
                name: nameRef.current.value,
                users: inGroup.map(user => user.userId)
            }))            
            dispatch(setIdle())        
        }
    }

    return (
        <div aria-label='create-group-window' className='flex flex-col justify-start items-start p-2'>

            <input aria-label='group-name' placeholder='group name' ref={nameRef}/>

            <input aria-label='contact-search-field' placeholder='search' onChange={handleSearch}/>

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
