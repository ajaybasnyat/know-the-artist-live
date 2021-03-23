import React from 'react';

const Artist = ({name, image, onClick}) => {
    return (
        <div className='artist-div' onClick={onClick}>
            <h2 id='artist-name'>{name} </h2>
            <img src={image} width="50%" height="50%" />
        </div>
    )
}

export default Artist;