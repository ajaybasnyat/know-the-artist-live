import React from 'react';

const Artist = ({name, image, onClick}) => {
    return (
        <div className='artist-div' onClick={onClick}>
            <h2 id='artist-name'>{name} </h2>
            <img src={image} width="300" height="300" alt='no image found'/>
        </div>
    )
}

export default Artist;