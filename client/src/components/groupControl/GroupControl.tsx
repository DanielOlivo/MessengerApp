import { useEffect, useRef } from "react"
import { useApDispatch, useAppSelector } from "../../app/hooks"
import { selectGroupId, selectGroupMembers, selectIsOn } from "../../features/group/groupSliceSelectors"
import Overlay from "../Overlay"
import { closeGroupControl, reqContacts, createGroup } from "../../features/group/groupSlice"
import { GroupMember, NewGroupReq } from "../../types/Client"
import MemberItem from './MemberItem'
import { selectUserId } from "../../features/auth/selectors"

const GroupControl = () => {

    const isOn = useAppSelector(selectIsOn)

    const dispatch = useApDispatch()
    const members = useAppSelector(selectGroupMembers) 
    const nameRef = useRef<HTMLInputElement>(null)

    const userId = useAppSelector(selectUserId)

    useEffect(() => {
        if(isOn){
            dispatch(reqContacts())
        }
    }, [isOn])

    const chatId = useAppSelector(selectGroupId)

    const createButton = () => {
        return (
            <button
                onClick={(e) => {
                    const _members = members
                        .filter(user => user.isMember)
                        .map(user => user.id)
                    const req: NewGroupReq = {
                        name: nameRef.current?.value || 'new group',
                        users: [userId!, ..._members]
                    }
                    dispatch(createGroup(req)) 
                    dispatch(closeGroupControl())
                }} 
            >Create</button>
        )
    }

    const editRemoveButtons = () => {
        return (
            <>
            <button>Edit</button>
            <button>Remove</button>
            </>
        )
    }

    if(!isOn){ return <></> }

    return (
        <Overlay closeFn={() => dispatch(closeGroupControl())}>
            <input 
                type='text'
                placeholder="group name"
                ref={nameRef}
            />
            <div
                className="flex flex-col justify-start overflow-y-auto" 
            >
                {members.map(member => <MemberItem member={member} />)}
            </div>

            {chatId ? editRemoveButtons() : createButton()}
            
        </Overlay>
    )
    
}

export default GroupControl