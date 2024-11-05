'use client';

import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Typography } from '@/shared/ui/Typography/Typography';
import Image from 'next/image';
import { getStoryViewerState } from '@/entities/Global';
import { GlobalWindow } from '@/entities/Global';
import { globalActions } from '@/entities/Global'; 
import styles from './StoryViewer.module.scss';
import { useCloudStorage } from '@/shared/lib/hooks/useCloudStorage/useCloudStorage';

// Импорт SVG
import Story1 from '@/shared/assets/icons/stories1.png';
import Story2 from '@/shared/assets/icons/stories2.png';
import Story3 from '@/shared/assets/icons/stories3.png';
import Story4 from '@/shared/assets/icons/stories4.png';
import { Window } from '@/shared/ui/Window/Window';

interface HighlightedTextProps {
  text: string;
  highlights?: string[];
  fontSize?: number;
}

const HighlightedText: FC<HighlightedTextProps> = ({ text, highlights = [], fontSize = 20 }) => {
    if (!highlights || highlights.length === 0) {
      return (
        <Typography.Text 
          text={text}
          color="#000"
          fontSize={fontSize}
          align="center"
          letterSpacing="-0.5px"
          weight={500}
          fontFamily='"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        />
      );
    }
  
    const highlightRegex = new RegExp(`(${highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(highlightRegex);
  
    return (
      <div style={{ 
        fontSize: `${fontSize}px`,
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 700,
        lineHeight: '24px',
        letterSpacing: '-0.5px'
      }}>
        {parts.map((part, index) => {
          const isHighlighted = highlights.some(h => 
            part.toLowerCase() === h.toLowerCase()
          );
          
          return (
            <Typography.Text
              key={index}
              text={part}
              color={isHighlighted ? '#007AFF' : '#000'}
              fontSize={fontSize}
              align="center"
              letterSpacing="-0.5px"
              weight={600}
              fontFamily='"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            />
          );
        })}
      </div>
    );
  };

const stories = [
  {
    description: "YoYo Swap is a convenient platform for exchanging cryptocurrency assets on leading networks",
    image: Story1,
    highlights: ['exchanging cryptocurrency', 'assets']
  },
  {
    description: "Create unlimited wallets and safely store your assets",
    image: Story2,
    highlights: ['safely store']
  },
  {
    description: "Earn up to 30% referral commission. Develop income in YoYo Swap!",
    image: Story3,
    highlights: ['up to 30 %', 'referral commission']
  },
  {
    description: "Welcome to YoYo Swap!",
    image: Story4,
    highlights: ['YoYo Swap']
  }
];

export const StoryViewer: FC<{ children?: ReactNode }> = () => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const STORY_DURATION = 5000; // 5 секунд на историю
    const PROGRESS_UPDATE_INTERVAL = 10; // Интервал обновления прогресса в мс
    
    const dispatch = useDispatch();
    const isVisible = useSelector(getStoryViewerState);
    const { setItem } = useCloudStorage();

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

    // Запуск анимации при изменении текущей истории
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

    // Очистка при размонтировании
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
        if (currentStoryIndex === stories.length - 1) {
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

    // Добавляем обработчики для паузы при удержании
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

    const isLastStory = currentStoryIndex === stories.length - 1;

    return (
        <Window
            isOpen={isVisible}
            btnText={isLastStory ? " Go to the wallet" : "Next"}
            btnOnClick={handleButtonClick}
            isBtnActive={true}
            height="100%"
            borderRadius="0"
            wrapperBorderRadius="0"
            bg="#F4F7FA"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.story_viewer}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
            >
                <div className={styles.progress_container}>
                    {stories.map((_, index) => (
                        <div key={index} className={styles.progress_bar}>
                            <div
                                className={styles.progress_fill}
                                style={{
                                    width: index < currentStoryIndex 
                                        ? '100%' 
                                        : index === currentStoryIndex 
                                            ? `${progress}%` 
                                            : '0%',
                                    transition: index === currentStoryIndex && !isPaused 
                                        ? 'none' 
                                        : 'width 0.3s ease'
                                }}
                            />
                        </div>
                    ))}
                </div>
  
          <div className={styles.content} onClick={handleStoryClick}>
            <div className={styles.image_container}>
              <Image
                src={stories[currentStoryIndex].image}
                alt="Story image"
                fill
                priority
                quality={100}
                sizes="100vw"
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
                className={styles.story_image}
              />
            </div>
  
            <div className={styles.text_container}>
              <Flex direction="column" gap={8}>
                {stories[currentStoryIndex].description && (
                  <HighlightedText 
                    text={stories[currentStoryIndex].description}
                    highlights={stories[currentStoryIndex].highlights}
                    fontSize={24}
                  />
                )}
              </Flex>
            </div>
          </div>
        </motion.div>
      </Window>
    );
  };