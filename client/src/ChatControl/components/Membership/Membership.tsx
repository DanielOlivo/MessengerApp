import React, { useRef } from 'react'
import { useApDispatch, useAppSelector } from '../../../app/hooks'
import { selectContactsInGroup, selectContactsNotInGroup, selectIsOnSearch } from '../../selectors'
import { searchContact } from '../../slice'
import { Contact, ContactProps } from '../Contact/Contact'

export const Membership = () => {

    const dispatch = useApDispatch()
    const onSearch = useAppSelector(selectIsOnSearch)
    const inGroup = useAppSelector(selectContactsInGroup)
    const notInGroup = useAppSelector(selectContactsNotInGroup)

    const searchRef = useRef<HTMLInputElement>(null)
    
    const propsNotInGroup: ContactProps[] = notInGroup.map(user => ({
        ...user,
        userId: user.userId,
        editable: true,
        inGroup: false
    }))
    // const inGroup = useAppSelector(select)

    return (
        <div
            aria-label='membership' 
        >
            <input 
                aria-label='contact-search-field'
                placeholder='search contacts'
                ref={searchRef}
                onChange={(e) => dispatch(searchContact(e.currentTarget.value))}
            />

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

            
        </div>
    )
}
