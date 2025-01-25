export interface LetterIconProp {
    letter: string
    front: string
    back: string
}

const LetterIcon = ({letter, front, back}: LetterIconProp) => {

    return (
        <div
            className="flex flex-row justify-center items-center rounded-full
            text-xs w-7 h-7
            " 
            style={{backgroundColor: back, color: front}}
        >
            {letter}
        </div>
    )
}

export default LetterIcon