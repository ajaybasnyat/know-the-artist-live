import React from 'react';

const Artist = ({name, image, onClick}) => {
    return (
        <div onClick={onClick}>
            <h1>{name} </h1>
            <img src={image} alt=""/>
        </div>
    )
}

export default Artist;