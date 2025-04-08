import logo from '../../../assets/logos/justLogo.jpg'

export const FormTitle = ({text}: {text: string}) => {
    return (
        <div className="formContainer" style={{position: 'absolute', top: '36px'}}>
            <div className="logo">
                <img src={logo} style={{ maxHeight: '100px' }} />
            </div>
            <h4 style={{ width: 'max-content' }}>{text}</h4>
        </div>

    )
}