import { ContactItem } from "../../../../types/Client"
import { useApDispatch } from "../../app/hooks"
import { clearResult, setState } from "../../features/chatList/chatListSlicer"
import LetterIcon from "../LetterIcon"

const UserItem = ({userId, username}: ContactItem) => {

    const dispatch = useApDispatch()

    return (
        <div
            className="flex flex-row justify-start items-center border border-gray-200 p-2
            hover:bg-slate-200 active:bg-slate-500 
            " 
            onClick={(e) => {
                dispatch(clearResult())
                dispatch(setState('list'))
                // todo - request chat
            }} 
        >
            <div
                className="for-icon w-9 h-9 flex flex-col justify-center items-center" 
            >
                {/* <div className="bg-slate-700 rounded-full w-8 h-8" /> */}
                <LetterIcon front='white' back='blue' letter={username.slice(0,1)} />
            </div>

            <div
                className="flex flex-col items-start justify-between ml-4 flex-grow" 
            >
                <label>{username}</label>
            </div>

        </div>
    )
}

export default UserItem