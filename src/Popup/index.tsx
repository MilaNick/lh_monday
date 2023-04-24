import './index.css'

function Popup(props: any) {
    const {shown, setShown, children} = props;

    if (!shown) {
        return null;
    }
    return (
        <div className='popup'>
            <div className='overlay' onClick={() => setShown(false)}/>
            <div className={`popup__content`}>
                {children}
            </div>
        </div>
    )
}

export default Popup;
