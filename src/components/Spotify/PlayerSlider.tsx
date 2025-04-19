import debounce from "lodash.debounce";
import { useCallback, useEffect, useState } from "react";

interface PlayerSliderProps {
    min: string;
    max: string;
    value: string;
    onChange: (value: number) => void;
}

const PlayerSlider = ({min, max, value, onChange}: PlayerSliderProps) => {
    const [currentValue, setCurrentValue] = useState(value)
    const [isMoving, setIsMoving] = useState(false)

    const debouncedSeek = useCallback(
        debounce((value: number) => {
          onChange(value * 1000);
        }, 500),
        [onChange] 
      );
      

      useEffect(() => {
        debouncedSeek(Number(currentValue));
      }, [currentValue]);
      
    return (
        <input
            
            onChange={(e: any) => setCurrentValue(e.target.value)}
            type="range"
            min={min}
            max={max}
            value={value}
            className="slider"></input>
    )
}

export default PlayerSlider;