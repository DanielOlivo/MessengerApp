import { humanIcons } from "../assets/assets";
import { IconProps } from "../common/Icon";

export function getRandomIcon(): IconProps {

    const values: string[] = Object.values(humanIcons)
    const idx: number = Number(Math.floor(Math.random() * values.length))

    return {
        iconSrc: values[idx],
        isOnline: false
    }
}