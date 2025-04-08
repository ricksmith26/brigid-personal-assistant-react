// import { PropsWithChildren } from "react";
import './Tile.css'

interface TileProps {
    title: string;
    children: any;
    colour?: string;
    backgroundColor?: string;
    style?: any
}

export const Tile = ({ title, children, colour = '#2c4953', backgroundColor='#b2cdd6', style={} }: TileProps) => {
    return (
        <div className="TileContainer" style={{border: `4px solid ${colour}`, ...style}}>
            <h3 className="titleText" style={{color: colour, backgroundColor: backgroundColor}}>{title}</h3>
            <>
                {children}
            </>
        </div>
    )
}