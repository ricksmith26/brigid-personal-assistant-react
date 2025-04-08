import './textInput.css'

type TextInputProps = {
    label?: string;
    name?: string;
    type?: string;
    placeholder: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    style?: {[key: string]: string}
  };

export const TextInput = ({label, name, placeholder = "Placeholder Text", onChange = () => {}, style = {}, value}: TextInputProps) => {
    return (
        <div className="custom_input">
            {label && <label className='textInputLabel'>{label}</label>}
            <input className="textInput" name={name} type="text" placeholder={placeholder} onChange={onChange} style={{...style}} value={value}/>
        </div>
    )
}