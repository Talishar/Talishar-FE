import { useAppDispatch } from "app/Hooks";
import { clearPopUp, setPopUp } from "features/game/GameSlice";
import useWindowDimensions from "hooks/useWindowDimensions";
import { ReactNode, useRef } from "react";

type CardPopUpProps = { 
    children: ReactNode, 
    cardNumber: string, 
    containerClass?: string, 
    onClick?: () => void, 
    isHidden?: boolean 
};

export default function CardPopUp({ children, cardNumber, containerClass, onClick, isHidden }: CardPopUpProps) {
    const ref = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const [windowWidth, windowHeight] = useWindowDimensions();

    const handleMouseEnter = () => {
        if (ref.current === null || isHidden === true) {
            return;
        }
        const rect = ref.current.getBoundingClientRect();
        const xCoord = rect.left < windowWidth / 2 ? rect.right : rect.left;
        const yCoord = rect.top < windowHeight / 2 ? rect.bottom : rect.top;
        dispatch(
            setPopUp({
                cardNumber,
                xCoord,
                yCoord
            })
        );
    };

    const handleMouseLeave = () => {
        dispatch(clearPopUp());
    };

    const handleOnClick = () => {
        if (onClick != null) {
            onClick();
        }
        handleMouseLeave();
    }

    return (
        <div
            className={containerClass}
            onClick={handleOnClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
            ref={ref}
        >
            {children}
        </div>
    )
}