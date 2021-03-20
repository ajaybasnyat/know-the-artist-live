import React from 'react';

const Artist = ({name, image, onClick}) => {
    return (
        <div onClick={onClick}>
            <h2>{name} </h2>
            <img src={image} alt=""/>
        </div>
    )
}

export default Artist;