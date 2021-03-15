import React from 'react';

const Artist = ({name, image}) => {
    return (
        <div>
            <h1>{name}</h1>
            <img src={image} alt=""/>
        </div>
    )
}

export default Artist;