import './Title.css'

export const AnimatedTitle = () => {
    return (
        <div className="animatedWrapper">
            <svg>
                <text x="50%" y="50%" dy=".35em" text-anchor="middle">
                    CSS Portal
                </text>
            </svg>
        </div>
    )
}