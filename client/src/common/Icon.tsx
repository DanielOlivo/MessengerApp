export interface IconProps {
    iconSrc: string
    isOnline: boolean
}

export const Icon = ({iconSrc, isOnline=false}: IconProps) => {
    return (
        <img
            className="w-10 h-10 rounded-full aspect-square"
            src={iconSrc}
        />
    )
}
