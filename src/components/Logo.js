'use client';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';

function Logo(){
    return (
        <div className="logo">
            <SlowMotionVideoIcon className="logo__icon" fontSize='large'/>
            <span className="logo__text">VidGen</span>
        </div>
    );
}

export default Logo;