import { FC, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStoryViewerState } from '@/entities/Global';
import { GlobalWindow } from '@/entities/Global';
import { globalActions } from '@/entities/Global';
import { useCloudStorage } from '@/shared/lib/hooks/useCloudStorage/useCloudStorage';
import { StoryContent } from './StoryContent';
import { stories } from './constants';
import styles from './StoryViewer.module.scss';

export const StoryViewer: FC<{ children?: ReactNode }> = () => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const STORY_DURATION = 5000;
    const PROGRESS_UPDATE_INTERVAL = 10;
    
    const dispatch = useDispatch();
    const isVisible = useSelector(getStoryViewerState);
    const { setItem } = useCloudStorage();

    const isLastStory = currentStoryIndex === stories.length - 1;

    const startProgressAnimation = useCallback(() => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        setProgress(0);
        const startTime = Date.now();

        progressInterval.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = (elapsedTime / STORY_DURATION) * 100;

            if (newProgress >= 100) {
                if (currentStoryIndex < stories.length - 1) {
                    setCurrentStoryIndex(prev => prev + 1);
                } else {
                    handleClose();
                }
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            } else {
                setProgress(newProgress);
            }
        }, PROGRESS_UPDATE_INTERVAL);
    }, [currentStoryIndex, stories.length]);

    useEffect(() => {
        if (!isPaused) {
            startProgressAnimation();
        }
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [currentStoryIndex, isPaused, startProgressAnimation]);

    useEffect(() => {
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    const handleClose = async () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        dispatch(globalActions.removeWindow(GlobalWindow.StoryViewer));
        try {
            await setItem('stories_viewed', 'true');
        } catch (error) {
            console.error('Error setting stories viewed:', error);
        }
    };

    const handleButtonClick = () => {
        if (isLastStory) {
            handleClose();
        } else {
            setCurrentStoryIndex(currentStoryIndex + 1);
        }
    };

    const handleStoryClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        if (x < rect.width / 2) {
            if (currentStoryIndex > 0) {
                setCurrentStoryIndex(currentStoryIndex - 1);
            }
        } else {
            if (currentStoryIndex < stories.length - 1) {
                setCurrentStoryIndex(currentStoryIndex + 1);
            } else {
                handleClose();
            }
        }
    };

    const handleTouchStart = () => {
        setIsPaused(true);
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    };

    const handleTouchEnd = () => {
        setIsPaused(false);
        startProgressAnimation();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <StoryContent
            currentStoryIndex={currentStoryIndex}
            buttonText={"Next"}
            progress={progress}
            isPaused={isPaused}
            handleStoryClick={handleStoryClick}
            handleButtonClick={handleButtonClick}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
        />
    );
};