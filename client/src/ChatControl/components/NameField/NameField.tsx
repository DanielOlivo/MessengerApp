import { useApDispatch, useAppSelector } from "../../../app/hooks"
import { selectIsAdmin, selectIsGroup, selectName } from "../../selectors"
import { setName } from "../../slice"

export const NameField = () => {

    const dispatch = useApDispatch()

    const name = useAppSelector(selectName)
    const isGroup = useAppSelector(selectIsGroup)
    const isAdmin = useAppSelector(selectIsAdmin)

    const isEditable = isGroup && isAdmin
    const invalidLength = isEditable && name.length < 4
    const invalidPattern = isEditable && !new RegExp(/^[a-zA-Z][a-zA-Z0-9 ]*$/).test(name)

    const errorClassnames = 'text-red-500 mt-2'

    return (
        <div className="flex flex-col justify-start items-start">
            <div className="flex flex-row justify-start items-center">
                <label>Name:</label>
                <input
                    aria-label='chat-control-name-field'
                    disabled={!isEditable}
                    value={name}
                    onChange={(e) => dispatch(setName(e.currentTarget.value))}
                />
            </div>
            {invalidLength && <p className={errorClassnames}>Group name length shoudl be at least 4</p>}
            {invalidPattern && <p className={errorClassnames}>Group name must consist only letters and digits</p>}
        </div>
    )
}
