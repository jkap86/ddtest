import React, { useEffect, useState } from 'react';
import './sliderToggle.css';

const SliderToggle = (props) => {
    const [selection, setSelection] = useState({ [props.name]: props.active })

    const slide = (e) => {
        setSelection({ [props.name]: e.target.name })
    }

    useEffect(() => {
        props.sendSelection(selection)
    }, [selection])

    return <span className="sliderwrapper">
        {props.names.map(name =>
            <span key={name} id={name} className={selection[props.name] === name ? 'selected' : 'option'}>
                <a name={name} onClick={slide}>{name}</a>
            </span>
        )}
    </span>
}

export default SliderToggle;