'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Typography } from '@/shared/ui/Typography/Typography';
import Image from 'next/image';
import { getStoryViewerState } from '@/entities/Global';
import { GlobalWindow } from '@/entities/Global';
import { globalActions } from '@/entities/Global'; 
import styles from './StoryViewer.module.scss';

// Импорт SVG
import Story1 from '@/shared/assets/icons/story1.svg';
import Story2 from '@/shared/assets/icons/story2.svg';
import Story3 from '@/shared/assets/icons/story3.svg';
import Story4 from '@/shared/assets/icons/story4.svg';
import { Window } from '@/shared/ui/Window/Window';
import { useCloudStorage } from '@/shared/lib/hooks/useCloudStorage/useCloudStorage';

interface HighlightedTextProps {
  text: string;
  highlights?: string[];
  fontSize?: number;
}

const HighlightedText: FC<HighlightedTextProps> = ({ text, highlights = [], fontSize = 16 }) => {
  if (!highlights || highlights.length === 0) {
    return (
      <Typography.Text 
        text={text}
        color="#000"
        fontSize={fontSize}
        align="center"
        letterSpacing="-0.2px"
      />
    );
  }

  const highlightRegex = new RegExp(`(${highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(highlightRegex);

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
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
  const dispatch = useDispatch();
  const isVisible = useSelector(getStoryViewerState);
  const [hasSeenStories, setHasSeenStories] = useState(false);
  const { getItem, setItem } = useCloudStorage();

  useEffect(() => {
    const checkStoriesViewed = async () => {
      try {
        const storiesViewed = await getItem('stories_viewed');
        if (!storiesViewed) {
          // Если пользователь еще не смотрел сторис, показываем их
          dispatch(globalActions.addWindow({
            window: GlobalWindow.StoryViewer,
          }));
          // Записываем в storage, что сторис были просмотрены
          await setItem('stories_viewed', 'true');
        } else {
          setHasSeenStories(true);
        }
      } catch (error) {
        console.error('Error checking stories viewed:', error);
        // В случае ошибки все равно показываем сторис
        dispatch(globalActions.addWindow({
          window: GlobalWindow.StoryViewer,
        }));
      }
    };

    checkStoriesViewed();
  }, [dispatch, getItem, setItem]);

  useEffect(() => {
    console.log('StoryViewer mounted');
    dispatch(globalActions.addWindow({
      window: GlobalWindow.StoryViewer,
    }));
    console.log('Window added to store');
  }, [dispatch]);

//   useEffect(() => {
//     console.log('Visibility changed:', isVisible);
//   }, [isVisible]);

const handleClose = async () => {
    console.log('Closing story viewer');
    dispatch(globalActions.removeWindow(GlobalWindow.StoryViewer));
    // При закрытии также записываем в storage
    try {
      await setItem('stories_viewed', 'true');
      setHasSeenStories(true);
    } catch (error) {
      console.error('Error setting stories viewed:', error);
    }
  };

  const handleStoryClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    if (x < rect.width / 2) {
      if (currentStoryIndex > 0) {
        console.log('Moving to previous story:', currentStoryIndex - 1);
        setCurrentStoryIndex(currentStoryIndex - 1);
      }
    } else {
      if (currentStoryIndex < stories.length - 1) {
        console.log('Moving to next story:', currentStoryIndex + 1);
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        console.log('Reached last story, closing');
        handleClose();
      }
    }
  };

  console.log('Current render state:', {
    isVisible,
    currentStoryIndex,
    totalStories: stories.length
  });

  if (!isVisible) {
    console.log('Component not visible, returning null');
    return null;
  }

  if (hasSeenStories || !isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.story_viewer}
    >
      <div className={styles.progress_container}>
        {stories.map((_, index) => (
          <div key={index} className={styles.progress_bar}>
            <div
              className={styles.progress_fill}
              style={{
                width: index <= currentStoryIndex ? '100%' : '0%'
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
            width={375}
            height={812}
            priority
          />
        </div>

        <div className={styles.text_container}>
          <Flex direction="column" gap={8}>
            {stories[currentStoryIndex].description && (
              <HighlightedText 
                text={stories[currentStoryIndex].description}
                highlights={stories[currentStoryIndex].highlights}
                fontSize={19}
              />
            )}
          </Flex>
        </div>
      </div>

      <button onClick={handleClose} className={styles.close_button}>
        ✕
      </button>
    </motion.div>
  );
};