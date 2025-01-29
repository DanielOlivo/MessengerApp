import { GroupMember } from "../../../../types/Client"
import { useApDispatch } from "../../app/hooks"
import { exclude, include } from "../../features/group/groupSlice"

interface MemberItemProp {
    member: GroupMember
}

const MemberItem  = ({member}: MemberItemProp) => {

    const {id, username, isMember} = member

    const dispatch = useApDispatch()

    return (
        <div
            className="flex flex-row justify-start items-center" 
        >
            <input 
                type='checkbox'
                defaultChecked={isMember}
                onChange={(e) => {
                    e.target.checked ? dispatch(include(id)) : dispatch(exclude(id))
                }}
            />
            <label>{username}</label>
        </div>
    )
}

export default MemberItem