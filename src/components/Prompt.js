"use client";
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createVideoAction } from '@/lib/actions/video/actions';
import { useVideoFeedContext } from './VideoContext';
import '@/styles/prompt.scss';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button className="prompt__submit button" type="submit" disabled={pending}>
            <span>{pending ? "Processing..." : "Generate Video"}</span>
        </button>
    );
}

function Prompt() {
    const { refreshFeed } = useVideoFeedContext();
    const [state, formAction] = useActionState(createVideoAction, {
        success: null,
        error: null,
    });

    const formRef = useRef(null);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            refreshFeed();
        }
    }, [state, refreshFeed]);

    return (
        <div className="prompt">
            <form ref={formRef} action={formAction} className="prompt__form">
                <textarea 
                    name="prompt" 
                    placeholder="Describe your video..." 
                    className="prompt__textarea" 
                    required 
                />
                <SubmitButton />

                {state?.error && (
                    <p className="prompt__message prompt__message--error">{state.error}</p>
                )}
                {state?.success && (
                    <p className="prompt__message prompt__message--success">Video generated!</p>
                )}
            </form>
        </div>
    );
}

export default Prompt;